import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function buildRedactedPdf(redactedText) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontSize = 10;
  const lineHeight = 14;
  const margin = 50;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const maxWidth = pageWidth - margin * 2;

  const lines = [];
  const paragraphs = redactedText.split("\n");

  for (const para of paragraphs) {
    if (para.trim() === "") {
      lines.push("");
      continue;
    }
    // Word-wrap
    const words = para.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? currentLine + " " + word : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  let y = pageHeight - margin;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  for (const line of lines) {
    if (y < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (line.trim()) {
      // Check for redaction tokens and draw black boxes over them
      const redactPattern = /\[REDACTED_[A-Z_]+\]/g;
      let lastIndex = 0;
      let x = margin;
      let match;

      while ((match = redactPattern.exec(line)) !== null) {
        // Draw normal text before the match
        const before = line.substring(lastIndex, match.index);
        if (before) {
          page.drawText(before, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.15, 0.15, 0.15),
          });
          x += font.widthOfTextAtSize(before, fontSize);
        }

        // Draw the black redaction box
        const tokenWidth = font.widthOfTextAtSize(match[0], fontSize);
        page.drawRectangle({
          x,
          y: y - 2,
          width: tokenWidth,
          height: fontSize + 4,
          color: rgb(0, 0, 0),
        });
        // Draw the token text in white on top
        page.drawText(match[0], {
          x: x + 2,
          y,
          size: fontSize - 2,
          font,
          color: rgb(1, 1, 1),
        });
        x += tokenWidth;
        lastIndex = match.index + match[0].length;
      }

      // Draw remaining text after last match
      const remaining = line.substring(lastIndex);
      if (remaining) {
        page.drawText(remaining, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
      }
    }

    y -= lineHeight;
  }

  return await pdfDoc.save();
}
