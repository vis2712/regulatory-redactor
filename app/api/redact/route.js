import "./utils/polyfill.js";
import { NextResponse } from "next/server";
import { geminiExtractPIIPhrases } from "./utils/geminiClient.js";
import { applyCoordinateRedactions } from "./utils/coordinateRedact.js";
import { regexRedact } from "./utils/regexRedact.js";
import { PDFParse } from "pdf-parse";


async function parsePdfText(buffer) {
  let parser = null;
  const textItems = [];
  try {
    parser = new PDFParse({ data: buffer });
    const parsedDoc = await parser.load();
    const numPages = parsedDoc.numPages;

    for (let i = 0; i < numPages; i++) {
      const page = await parsedDoc.getPage(i + 1);
      await page.getOperatorList();
      const textContent = await page.getTextContent();

      for (const item of textContent.items) {
        if (!item.str || !item.transform) continue;
        
        const fontObj = page.commonObjs.get(item.fontName);
        const isMono = fontObj
          ? !!fontObj.isMonospace
          : /courier|mono|consolas|fixed/i.test(item.fontName || "");

        textItems.push({
          page: i,
          str: item.str,
          width: item.width,
          height: Math.abs(item.transform[0]) || 10,
          transform: item.transform,
          isMono: isMono,
        });
      }
    }
    const fullText = textItems.map((item) => item.str).join(" ");
    return { textItems, fullText };
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {}
    }
  }
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const action = form.get("action");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Action: analyze ──
    if (action === "analyze") {
      let textItems, fullText;
      try {
        const parsed = await parsePdfText(buffer);
        textItems = parsed.textItems;
        fullText = parsed.fullText;
      } catch (parseErr) {
        console.error("PDF text extraction error:", parseErr);
        return NextResponse.json(
          { error: "Failed to parse document text layer." },
          { status: 500 }
        );
      }

      // Call text-based Gemini PII phrase extraction
      const aiPhrases = await geminiExtractPIIPhrases(fullText);
      const regexPhrases = regexRedact(fullText).matches.map((match) => match.text);
      const targetPhrases = Array.from(new Set([...aiPhrases, ...regexPhrases]))
        .filter((phrase) => phrase && phrase.trim());

      // Count occurrences and get page numbers for each detected phrase
      const detectedItems = targetPhrases.map((phrase) => {
        const lowerPhrase = phrase.toLowerCase();
        let count = 0;
        const pages = new Set();
        for (const item of textItems) {
          if (!item.str) continue;
          const lowerStr = item.str.toLowerCase();
          let idx = -1;
          while ((idx = lowerStr.indexOf(lowerPhrase, idx + 1)) !== -1) {
            count++;
            pages.add(item.page + 1); // 1-indexed for display
          }
        }
        return {
          word: phrase,
          occurrenceCount: count,
          enabled: true,
          source: "ai",
          pages: Array.from(pages).sort((a, b) => a - b),
        };
      }).filter((item) => item.occurrenceCount > 0);

      // Return simplified textItems as textStrings for client side use
      const textStrings = textItems.map((item) => ({
        str: item.str,
        page: item.page, // 0-indexed page number
      }));

      return NextResponse.json({
        detectedItems,
        textStrings,
      });
    }

    // ── Action: redact ──
    if (action === "redact") {
      const targetsJson = form.get("targets");
      if (!targetsJson) {
        return NextResponse.json(
          { error: "No target words specified for manual redaction." },
          { status: 400 }
        );
      }

      let targets;
      try {
        targets = JSON.parse(targetsJson);
      } catch {
        return NextResponse.json(
          { error: "Invalid target list format." },
          { status: 400 }
        );
      }

      let textItems;
      try {
        const parsed = await parsePdfText(buffer);
        textItems = parsed.textItems;
      } catch (parseErr) {
        console.error("PDF text extraction error:", parseErr);
        return NextResponse.json(
          { error: "Failed to parse document text layer." },
          { status: 500 }
        );
      }

      if (targets.length === 0) {
        return new Response(buffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="redacted-document.pdf"',
            "Content-Length": buffer.length.toString(),
            "x-redacted-count": "0",
          },
        });
      }

      let redactedPdfBytes;
      try {
        redactedPdfBytes = await applyCoordinateRedactions(buffer, targets, textItems);
      } catch (pdfErr) {
        console.error("PDF redaction drawing error:", pdfErr);
        return NextResponse.json(
          { error: "Failed to apply redaction masks." },
          { status: 500 }
        );
      }

      const redactedBuffer = Buffer.from(redactedPdfBytes);
      return new Response(redactedBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="redacted-document.pdf"',
          "Content-Length": redactedBuffer.length.toString(),
          "x-redacted-count": targets.length.toString(),
        },
      });
    }

    // ── Default / Smart Redaction ──
    let textItems, fullText;
    try {
      const parsed = await parsePdfText(buffer);
      textItems = parsed.textItems;
      fullText = parsed.fullText;
    } catch (parseErr) {
      console.error("PDF text extraction error:", parseErr);
      return NextResponse.json(
        { error: "Failed to parse document text layer." },
        { status: 500 }
      );
    }

    const aiPhrases = await geminiExtractPIIPhrases(fullText);
    const regexPhrases = regexRedact(fullText).matches.map((match) => match.text);
    const targetPhrases = Array.from(new Set([...aiPhrases, ...regexPhrases]))
      .filter((phrase) => phrase && phrase.trim());

    if (targetPhrases.length === 0) {
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="redacted-document.pdf"',
          "Content-Length": buffer.length.toString(),
          "x-redacted-count": "0",
        },
      });
    }

    let redactedPdfBytes;
    try {
      redactedPdfBytes = await applyCoordinateRedactions(buffer, targetPhrases, textItems);
    } catch (pdfErr) {
      console.error("PDF redaction drawing error:", pdfErr);
      return NextResponse.json(
        { error: "Failed to apply redaction masks." },
        { status: 500 }
      );
    }

    const redactedBuffer = Buffer.from(redactedPdfBytes);
    return new Response(redactedBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="redacted-document.pdf"',
        "Content-Length": redactedBuffer.length.toString(),
        "x-redacted-count": targetPhrases.length.toString(),
      },
    });

  } catch (err) {
    console.error("Redaction pipeline error:", err);
    return NextResponse.json(
      { error: err.message || "Processing failed. Please try again." },
      { status: 500 }
    );
  }
}
