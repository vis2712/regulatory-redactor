import "./utils/polyfill.js";
import { NextResponse } from "next/server";
import { geminiExtractPIIPhrases } from "./utils/geminiClient.js";
import { applyCoordinateRedactions } from "./utils/coordinateRedact.js";
import { regexRedact } from "./utils/regexRedact.js";
import { PDFParse } from "pdf-parse";


export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Step 1: Extract text items and locations in memory using pdf-parse ──
    let parser = null;
    let textItems = [];
    let fullText = "";

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
      fullText = textItems.map((item) => item.str).join(" ");
    } catch (parseErr) {
      console.error("PDF text extraction error:", parseErr);
      return NextResponse.json(
        { error: "Failed to parse document text layer." },
        { status: 500 }
      );
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch {}
      }
    }

    // ── Step 2: Call text-based Gemini PII phrase extraction ──
    const aiPhrases = await geminiExtractPIIPhrases(fullText);
    const regexPhrases = regexRedact(fullText).matches.map((match) => match.text);
    const targetPhrases = Array.from(new Set([...aiPhrases, ...regexPhrases]))
      .filter((phrase) => phrase && phrase.trim());

    if (targetPhrases.length === 0) {
      // No PII found — return original PDF buffer directly
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="redacted-document.pdf"',
          "Content-Length": buffer.length.toString(),
          "x-redacted-count": "0",
        },
      });
    }

    // ── Step 3: Apply precision pixel-overlay redaction masks ──
    let redactedPdfBytes;
    try {
      redactedPdfBytes = await applyCoordinateRedactions(buffer, targetPhrases, textItems);
    } catch (pdfErr) {
      console.error("PDF redaction drawing error:", pdfErr);
      return NextResponse.json(
        { error: "Failed to apply redaction masks. The document structure may be unsupported." },
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
