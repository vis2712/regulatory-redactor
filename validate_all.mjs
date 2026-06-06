import fs from "fs";
import { PDFParse } from "pdf-parse";
import { geminiExtractPIIPhrases } from "./app/api/redact/utils/geminiClient.js";
import { applyCoordinateRedactions } from "./app/api/redact/utils/coordinateRedact.js";
import { regexRedact } from "./app/api/redact/utils/regexRedact.js";
import dotenv from "dotenv";

dotenv.config();

async function runPipeline(inputPath, outputPath) {
  const buffer = fs.readFileSync(inputPath);
  const textItems = [];
  const parser = new PDFParse({ data: buffer });
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
  await parser.destroy();
  const fullText = textItems.map((item) => item.str).join(" ");
  
  const aiPhrases = await geminiExtractPIIPhrases(fullText);
  const regexPhrases = regexRedact(fullText).matches.map((match) => match.text);
  const targetPhrases = Array.from(new Set([...aiPhrases, ...regexPhrases]))
    .filter((phrase) => phrase && phrase.trim());
  console.log(`\n[${inputPath}] Target PII:`, targetPhrases);
  
  const redactedBytes = await applyCoordinateRedactions(buffer, targetPhrases, textItems);
  fs.writeFileSync(outputPath, redactedBytes);
  console.log(`[${inputPath}] Saved redacted output to ${outputPath}`);
  
  // Verify text layer
  const verifyParser = new PDFParse({ data: redactedBytes });
  const verifyDoc = await verifyParser.load();
  let verifiedText = "";
  for (let i = 0; i < verifyDoc.numPages; i++) {
    const page = await verifyDoc.getPage(i + 1);
    const textContent = await page.getTextContent();
    for (const item of textContent.items) {
      if (item.str) verifiedText += item.str + " ";
    }
  }
  await verifyParser.destroy();
  
  console.log(`[${inputPath}] Verification Report:`);
  for (const target of targetPhrases) {
    const isPresent = verifiedText.includes(target);
    console.log(`  - Target "${target}": present? ${isPresent ? "❌ YES (FAIL)" : "✅ NO (SUCCESS)"}`);
  }
}

async function main() {
  await runPipeline("./files/input-file-1.pdf", "./files/res1_test.pdf");
  await runPipeline("./files/input-file-2.pdf", "./files/res2_test.pdf");
  await runPipeline("./files/input-file-3.pdf", "./files/res3_test.pdf");
}

main().catch(console.error);
