import { PDFDocument, StandardFonts, rgb, PDFName, PDFRawStream, PDFArray } from "pdf-lib";
import zlib from "zlib";

function multiply(A, B) {
  return [
    A[0]*B[0] + A[1]*B[2],
    A[0]*B[1] + A[1]*B[3],
    A[2]*B[0] + A[3]*B[2],
    A[2]*B[1] + A[3]*B[3],
    A[4]*B[0] + A[5]*B[2] + B[4],
    A[4]*B[1] + A[5]*B[3] + B[5]
  ];
}

/**
  * Infinite-loop-proof PDF content stream tokenizer.
  * Ensures 'i' is always incremented by at least 1 in every loop.
  */
function tokenizeContentStream(text) {
  const tokens = [];
  let i = 0;
  const len = text.length;
  while (i < len) {
    const char = text[i];
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f' || char === '\v') {
      i++;
      continue;
    }
    if (char === '(') {
      let str = "(";
      let depth = 1;
      i++;
      while (i < len && depth > 0) {
        const c = text[i];
        if (c === '\\') {
          str += c + (text[i+1] || "");
          i += 2;
        } else if (c === '(') {
          depth++;
          str += c;
          i++;
        } else if (c === ')') {
          depth--;
          str += c;
          i++;
        } else {
          str += c;
          i++;
        }
      }
      tokens.push({ type: "string", raw: str });
      continue;
    }
    if (char === '<') {
      if (text[i+1] === '<') {
        let dict = "<<";
        i += 2;
        let depth = 1;
        while (i < len && depth > 0) {
          if (text[i] === '<' && text[i+1] === '<') {
            depth++;
            dict += "<<";
            i += 2;
          } else if (text[i] === '>' && text[i+1] === '>') {
            depth--;
            dict += ">>";
            i += 2;
          } else {
            dict += text[i];
            i++;
          }
        }
        tokens.push({ type: "dict", raw: dict });
      } else {
        let hex = "<";
        i++;
        while (i < len && text[i] !== '>') {
          hex += text[i];
          i++;
        }
        if (i < len) {
          hex += ">";
          i++;
        }
        tokens.push({ type: "hex_string", raw: hex });
      }
      continue;
    }
    if (char === '[') {
      tokens.push({ type: "array_start", raw: "[" });
      i++;
      continue;
    }
    if (char === ']') {
      tokens.push({ type: "array_end", raw: "]" });
      i++;
      continue;
    }
    let token = "";
    while (i < len) {
      const c = text[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v' ||
          c === '(' || c === ')' || c === '[' || c === ']' || c === '<' || c === '>') {
        break;
      }
      token += c;
      i++;
    }
    if (token !== "") {
      tokens.push({ type: "word", raw: token });
    } else {
      tokens.push({ type: "word", raw: char });
      i++;
    }
  }
  return tokens;
}

function parsePdfStringToken(token) {
  if (token.type === "string") {
    const raw = token.raw.slice(1, -1);
    const bytes = [];
    let i = 0;
    while (i < raw.length) {
      if (raw[i] === '\\') {
        const next = raw[i+1];
        if (next === 'n') { bytes.push(10); i += 2; }
        else if (next === 'r') { bytes.push(13); i += 2; }
        else if (next === 't') { bytes.push(9); i += 2; }
        else if (next === 'b') { bytes.push(8); i += 2; }
        else if (next === 'f') { bytes.push(12); i += 2; }
        else if (next === '(' || next === ')' || next === '\\') { bytes.push(next.charCodeAt(0)); i += 2; }
        else if (/[0-7]/.test(next)) {
          let octalStr = next;
          i += 2;
          if (i < raw.length && /[0-7]/.test(raw[i])) { octalStr += raw[i]; i++; }
          if (i < raw.length && /[0-7]/.test(raw[i])) { octalStr += raw[i]; i++; }
          bytes.push(parseInt(octalStr, 8));
        } else {
          i++;
        }
      } else {
        bytes.push(raw.charCodeAt(i));
        i++;
      }
    }
    return new Uint8Array(bytes);
  } else if (token.type === "hex_string") {
    const raw = token.raw.slice(1, -1).replace(/\s/g, "");
    const bytes = new Uint8Array(raw.length / 2);
    for (let k = 0; k < bytes.length; k++) {
      bytes[k] = parseInt(raw.slice(k*2, k*2+2), 16);
    }
    return bytes;
  }
  return null;
}

function serializePdfStringToken(bytes, originalType) {
  if (originalType === "hex_string") {
    let hex = "<";
    for (let k = 0; k < bytes.length; k++) {
      hex += bytes[k].toString(16).padStart(2, "0").toUpperCase();
    }
    hex += ">";
    return hex;
  } else {
    let str = "(";
    for (let k = 0; k < bytes.length; k++) {
      const b = bytes[k];
      if (b === 40) str += "\\(";
      else if (b === 41) str += "\\)";
      else if (b === 92) str += "\\\\";
      else if (b === 10) str += "\\n";
      else if (b === 13) str += "\\r";
      else if (b === 9) str += "\\t";
      else str += String.fromCharCode(b);
    }
    str += ")";
    return str;
  }
}

function detectCharSize(bytes) {
  if (!bytes || bytes.length === 0) return 1;
  if (bytes.length % 2 === 0) {
    let zeroOrOneCount = 0;
    for (let k = 0; k < bytes.length; k += 2) {
      if (bytes[k] === 0 || bytes[k] === 1) {
        zeroOrOneCount++;
      }
    }
    const ratio = zeroOrOneCount / (bytes.length / 2);
    if (ratio > 0.3) {
      return 2;
    }
  }
  return 1;
}

/**
  * Robust space code detector.
  * Employs frequency difference matching to find custom space codes
  * in fonts that render spacing via custom byte values.
  */
function detectSpaceCodes(opChars, itemStr) {
  const spaceCodes = new Set([32]);
  let targetNonSpaceCount = 0;
  for (let k = 0; k < itemStr.length; k++) {
    const c = itemStr[k];
    if (c !== " " && c !== "\t" && c !== "\n" && c !== "\r") {
      targetNonSpaceCount++;
    }
  }
  const totalOpChars = opChars.length;
  const neededSpaces = totalOpChars - targetNonSpaceCount;
  if (neededSpaces > 0) {
    const freq = {};
    for (const c of opChars) {
      if (c !== 32) freq[c] = (freq[c] || 0) + 1;
    }
    let bestCode = null;
    let minDiff = Infinity;
    for (const codeStr in freq) {
      const code = parseInt(codeStr, 10);
      const f = freq[code];
      const diff = Math.abs(f - neededSpaces);
      if (diff < minDiff) {
        minDiff = diff;
        bestCode = code;
      }
    }
    if (bestCode !== null && minDiff <= 3) {
      spaceCodes.add(bestCode);
    }
  }
  return spaceCodes;
}

// Corporate/standard PII noise words that must not be split into global target tokens
const GENERIC_WORDS = new Set([
  "and", "the", "for", "of", "to", "in", "at", "on", "with", "by", "an", "a", "or",
  "company", "corporation", "corp", "inc", "incorporated", "llc", "ltd", "limited",
  "association", "department", "dept", "management", "project", "housing", "development",
  "services", "financial", "bank", "national", "federal", "state", "city", "county",
  "board", "commission", "agency", "institute", "university", "college", "school",
  "group", "system", "systems", "international", "global", "solutions", "partners",
  "ventures", "capital", "holdings", "trust", "union", "association", "committee",
  "name", "phone", "email", "e-mail", "address", "street", "zip"
]);

/**
 * Apply visual redaction boxes and strip underlying text metadata inside PDF content streams.
 *
 * @param {Buffer|Uint8Array} originalPdfBytes - The original uploaded PDF
 * @param {Array<string>} targets - Flat array of target words/phrases to redact
 * @param {Array<{page: number, str: string, width: number, height: number, transform: number[], isMono: boolean}>} textItems - Native PDF text items
 * @returns {Promise<Uint8Array>} - Modified PDF bytes
 */
export async function applyCoordinateRedactions(originalPdfBytes, targets, textItems) {
  const pdfDoc = await PDFDocument.load(originalPdfBytes, {
    ignoreEncryption: true,
  });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const targetSet = new Set();
  for (const t of targets) {
    if (!t || t.trim() === "") continue;
    const trimmed = t.trim();
    const lowerTrimmed = trimmed.toLowerCase();
    let foundAny = false;
    for (const item of textItems) {
      if (!item.str) continue;
      const lowerStr = item.str.toLowerCase();
      let index = -1;
      while ((index = lowerStr.indexOf(lowerTrimmed, index + 1)) !== -1) {
        const originalMatch = item.str.substring(index, index + trimmed.length);
        targetSet.add(originalMatch);
        foundAny = true;
      }
    }

    if (!foundAny) {
      targetSet.add(trimmed);
    }
    
    // Add title-case personal-name tokens as a fallback for PDFs that split a
    // full name across text items. Avoid splitting addresses, IDs, placeholders,
    // all-caps organizations, emails, and boilerplate phrases into global words.
    const words = trimmed.split(/\s+/);
    for (const w of words) {
      const cleanWord = w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const looksLikeNameWord = /^[A-Z][a-z]+(?:['-][A-Za-z]+)?$/.test(w);
      if (looksLikeNameWord && cleanWord.length >= 3 && !GENERIC_WORDS.has(cleanWord)) {
        for (const item of textItems) {
          if (!item.str) continue;
          const lowerStr = item.str.toLowerCase();
          let idx = -1;
          while ((idx = lowerStr.indexOf(cleanWord, idx + 1)) !== -1) {
            const originalMatch = item.str.substring(idx, idx + w.length);
            targetSet.add(originalMatch);
          }
        }
        targetSet.add(w);
      }
    }
  }

  console.log("Active redaction target tokens:", Array.from(targetSet));

  const redactionRects = [];

  // First collect mask rectangles. They are drawn after text-stream cleanup so
  // later content rewrites cannot drop the visual redactions.
  for (const item of textItems) {
    if (!item.str || !item.transform) continue;

    for (const target of targetSet) {
      let index = -1;
      
      while ((index = item.str.indexOf(target, index + 1)) !== -1) {
        const prefix = item.str.substring(0, index);
        let wordX, wordWidth;

        // Dynamic coordinate snapping based on font metrics (monospace vs proportional)
        if (item.isMono) {
          const charRatio = item.str.length > 0 ? prefix.length / item.str.length : 0;
          const targetRatio = item.str.length > 0 ? target.length / item.str.length : 0;
          wordX = item.transform[4] + item.width * charRatio;
          wordWidth = item.width * targetRatio;
        } else {
          // Measure layout widths in standard font size 1
          const fullW = font.widthOfTextAtSize(item.str, 1);
          const prefixW = font.widthOfTextAtSize(prefix, 1);
          const wordW = font.widthOfTextAtSize(target, 1);

          const scale = fullW > 0 ? item.width / fullW : 1;

          wordX = item.transform[4] + prefixW * scale;
          wordWidth = wordW * scale;
        }

        const wordY = item.transform[5];
        const wordHeight = item.height;

        const pageIndex = item.page;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const padX = 2.0;
        const padY = 2.5;

        redactionRects.push({
          pageIndex,
          x: wordX - padX,
          y: wordY - padY - wordHeight * 0.25,
          width: wordWidth + padX * 2,
          height: wordHeight * 1.1 + padY * 2,
        });
      }
    }
  }

  // Text Layer Cleaning Pass: strip matching characters from content streams
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const context = page.node.context;
    
    const pageTextItems = textItems.filter(item => item.page === pageIndex);
    if (pageTextItems.length === 0) continue;
    
    const contentsRef = page.node.get(PDFName.of("Contents"));
    if (!contentsRef) continue;
    
    const contents = context.lookup(contentsRef);
    let unifiedText = "";
    const streamRefs = [];
    const streamObjs = [];
    
    if (contents instanceof PDFRawStream) {
      streamRefs.push(contentsRef);
      streamObjs.push(contents);
      const filter = contents.dict.get(PDFName.of("Filter"));
      const decompressed = filter?.toString() === "/FlateDecode"
        ? zlib.unzipSync(contents.contents)
        : contents.contents;
      unifiedText = Buffer.from(decompressed).toString("latin1");
    } else if (contents instanceof PDFArray) {
      for (let i = 0; i < contents.size(); i++) {
        const ref = contents.get(i);
        const s = context.lookup(ref);
        if (s instanceof PDFRawStream) {
          streamRefs.push(ref);
          streamObjs.push(s);
          const filter = s.dict.get(PDFName.of("Filter"));
          const decompressed = filter?.toString() === "/FlateDecode"
            ? zlib.unzipSync(s.contents)
            : s.contents;
          unifiedText += Buffer.from(decompressed).toString("latin1") + "\n";
        }
      }
    }
    
    if (streamObjs.length === 0) continue;
    
    const tokens = tokenizeContentStream(unifiedText);
    
    let ctm = [1, 0, 0, 1, 0, 0];
    const stateStack = [];
    let tm = [1, 0, 0, 1, 0, 0];
    let tlm = [1, 0, 0, 1, 0, 0];
    let modified = false;
    
    const opList = [];
    
    for (let idx = 0; idx < tokens.length; idx++) {
      const t = tokens[idx];
      const raw = t.raw;
      
      if (raw === "q") {
        stateStack.push({ ctm: [...ctm] });
      } else if (raw === "Q") {
        const state = stateStack.pop();
        if (state) ctm = state.ctm;
      } else if (raw === "cm") {
        const a = parseFloat(tokens[idx-6].raw);
        const b = parseFloat(tokens[idx-5].raw);
        const c = parseFloat(tokens[idx-4].raw);
        const d = parseFloat(tokens[idx-3].raw);
        const e = parseFloat(tokens[idx-2].raw);
        const f = parseFloat(tokens[idx-1].raw);
        ctm = multiply([a, b, c, d, e, f], ctm);
      } else if (raw === "BT") {
        tm = [1, 0, 0, 1, 0, 0];
        tlm = [1, 0, 0, 1, 0, 0];
      } else if (raw === "Tm") {
        const a = parseFloat(tokens[idx-6].raw);
        const b = parseFloat(tokens[idx-5].raw);
        const c = parseFloat(tokens[idx-4].raw);
        const d = parseFloat(tokens[idx-3].raw);
        const e = parseFloat(tokens[idx-2].raw);
        const f = parseFloat(tokens[idx-1].raw);
        tm = [a, b, c, d, e, f];
        tlm = [...tm];
      } else if (raw === "Td") {
        const tx = parseFloat(tokens[idx-2].raw);
        const ty = parseFloat(tokens[idx-1].raw);
        tm = multiply([1, 0, 0, 1, tx, ty], tlm);
        tlm = [...tm];
      } else if (raw === "Tj" || raw === "TJ") {
        const absM = multiply(tm, ctm);
        const opX = absM[4];
        const opY = absM[5];
        
        let matchedItem = null;
        for (const item of pageTextItems) {
          if (!item.str || item.str.trim() === "") continue;
          
          const itemX = item.transform[4];
          const itemY = item.transform[5];
          const itemWidth = item.width;
          
          if (Math.abs(itemY - opY) < 2.0) {
            if (opX >= itemX - 5.0 && opX <= itemX + itemWidth + 5.0) {
              matchedItem = item;
              break;
            }
          }
        }
        
        if (matchedItem) {
          opList.push({
            idx,
            raw,
            opX,
            opY,
            matchedItem,
          });
        }
      }
    }
    
    const groups = new Map();
    for (const op of opList) {
      if (!groups.has(op.matchedItem)) {
        groups.set(op.matchedItem, []);
      }
      groups.get(op.matchedItem).push(op);
    }
    
    for (const [item, ops] of groups.entries()) {
      let matchesPII = false;
      for (const target of targetSet) {
        if (item.str.includes(target)) {
          matchesPII = true;
          break;
        }
      }
      
      if (!matchesPII) continue;
      
      ops.sort((a, b) => a.opX - b.opX);
      
      const redactMask = new Array(item.str.length).fill(false);
      for (const target of targetSet) {
        let startIdx = -1;
        while ((startIdx = item.str.indexOf(target, startIdx + 1)) !== -1) {
          for (let k = 0; k < target.length; k++) {
            redactMask[startIdx + k] = true;
          }
        }
      }
      
      const nonSpaceIndices = [];
      for (let k = 0; k < item.str.length; k++) {
        if (item.str[k] !== " " && item.str[k] !== "\t" && item.str[k] !== "\n") {
          nonSpaceIndices.push(k);
        }
      }
      
      const opStringInfos = [];
      const allOpChars = [];
      
      for (const op of ops) {
        const stringTokens = [];
        if (op.raw === "Tj") {
          stringTokens.push(tokens[op.idx - 1]);
        } else if (op.raw === "TJ") {
          let arrayStartIdx = op.idx - 1;
          while (arrayStartIdx >= 0 && tokens[arrayStartIdx].raw !== "[") {
            arrayStartIdx--;
          }
          if (arrayStartIdx >= 0) {
            for (let k = arrayStartIdx + 1; k < op.idx; k++) {
              if (tokens[k].type === "string" || tokens[k].type === "hex_string") {
                stringTokens.push(tokens[k]);
              }
            }
          }
        }
        
        const bytesList = stringTokens.map(tok => parsePdfStringToken(tok));
        
        for (let tIdx = 0; tIdx < stringTokens.length; tIdx++) {
          const bytes = bytesList[tIdx];
          if (!bytes) continue;
          const charSize = detectCharSize(bytes);
          const numChars = Math.round(bytes.length / charSize);
          
          for (let charIdx = 0; charIdx < numChars; charIdx++) {
            const b1 = bytes[charIdx * charSize];
            const b2 = (charSize === 2) ? bytes[charIdx * charSize + 1] : 0;
            const glyphCode = (charSize === 1) ? b1 : (b1 << 8) | b2;
            allOpChars.push(glyphCode);
          }
        }
        
        opStringInfos.push({
          op,
          stringTokens,
          bytesList,
        });
      }
      
      const spaceCodes = detectSpaceCodes(allOpChars, item.str);
      
      let currentNonSpaceOffset = 0;
      
      for (const info of opStringInfos) {
        for (let tIdx = 0; tIdx < info.stringTokens.length; tIdx++) {
          const tok = info.stringTokens[tIdx];
          const bytes = info.bytesList[tIdx];
          if (!bytes) continue;
          
          const charSize = detectCharSize(bytes);
          const numChars = Math.round(bytes.length / charSize);
          
          for (let charIdx = 0; charIdx < numChars; charIdx++) {
            const b1 = bytes[charIdx * charSize];
            const b2 = (charSize === 2) ? bytes[charIdx * charSize + 1] : 0;
            const glyphCode = (charSize === 1) ? b1 : (b1 << 8) | b2;
            
            if (spaceCodes.has(glyphCode)) continue;
            
            const globalCharIdx = nonSpaceIndices[currentNonSpaceOffset];
            if (globalCharIdx !== undefined && redactMask[globalCharIdx]) {
              if (charSize === 1) {
                bytes[charIdx * charSize] = 0;
              } else if (charSize === 2) {
                bytes[charIdx * charSize] = 0;
                bytes[charIdx * charSize + 1] = 0;
              }
            }
            currentNonSpaceOffset++;
          }
          
          tok.raw = serializePdfStringToken(bytes, tok.type);
          modified = true;
        }
      }
    }
    
    if (modified) {
      const newText = tokens.map(t => t.raw).join(" ");
      const newBytes = Buffer.from(newText, "latin1");
      const compressedBytes = zlib.deflateSync(newBytes);
      
      const firstStream = streamObjs[0];
      firstStream.contents = compressedBytes;
      firstStream.dict.set(PDFName.of("Length"), context.obj(compressedBytes.length));
      
      if (contents instanceof PDFArray) {
        page.node.set(PDFName.of("Contents"), streamRefs[0]);
      }
    }
  }

  for (const rect of redactionRects) {
    const page = pages[rect.pageIndex];
    if (!page) continue;
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      color: rgb(0, 0, 0),
    });
  }

  const savedBytes = await pdfDoc.save();
  return savedBytes;
}
