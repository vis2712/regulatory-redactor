import { readFile } from "fs/promises";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function geminiExtractText({ filePath, mimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set – skipping AI text extraction");
    return "";
  }

  const fileData = await readFile(filePath);
  const base64 = fileData.toString("base64");

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          {
            text: "Extract ALL text content from this document exactly as it appears. Return only the raw text, nothing else.",
          },
        ],
      },
    ],
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Gemini extraction error:", await res.text());
    return "";
  }

  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function geminiDetectPII(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set – skipping AI PII detection");
    return [];
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a PII detection engine. Analyze the following text and identify ALL personally identifiable information that should be redacted for privacy compliance (GDPR, CCPA, HIPAA).

Look for:
- Full names of people
- Physical/mailing addresses
- Corporate job titles paired with names
- Date of birth
- Any other contextual PII

Do NOT include emails, phone numbers, SSNs, credit cards, or IP addresses (those are handled separately).

Return ONLY a valid JSON array of objects like:
[{"text": "exact string found", "type": "NAME"}, {"text": "123 Main St, Springfield, IL 62704", "type": "ADDRESS"}]

If no PII is found, return an empty array: []

Text to analyze:
---
${text}
---`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Gemini PII detection error:", await res.text());
    return [];
  }

  const json = await res.json();
  const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  try {
    const parsed = JSON.parse(reply);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Send the PDF/image to Gemini vision and ask it to locate ALL PII
 * with bounding box coordinates. Returns structured detection objects.
 *
 * Gemini returns coordinates in a normalized 0–1000 scale with origin
 * at the top-left of the page image.
 */
export async function geminiDetectPIIWithBoundingBoxes({
  filePath,
  mimeType,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY not set – skipping visual PII bounding box detection"
    );
    return [];
  }

  const fileData = await readFile(filePath);
  const base64 = fileData.toString("base64");

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          {
            text: `You are a STRICT regulatory compliance engine performing mandatory PII redaction for GDPR, CCPA, and HIPAA enforcement. You must achieve 100% recall — missing even a single piece of PII is a compliance violation.

CRITICAL SCANNING RULES:
1. You MUST scan the ENTIRE document exhaustively — every header, footer, metadata field, table cell, narrative paragraph, project update, meeting note, bullet point, and inline description.
2. You MUST identify EVERY single human name anywhere in the document. This includes:
   - Sender/recipient names in headers
   - Names in signature blocks
   - Colleague or team member names mentioned INLINE within tables, work logs, project updates, or meeting notes (e.g., "worked with Joydeep on...", "assigned to Sarah")
   - Names in email addresses (the local part before @)
   - Manager/supervisor names
   - Client or vendor contact names
   - ANY proper noun that refers to a real person
3. Do NOT limit detection to prominent or obvious names. Scan ALL text — including inside data tables, task descriptions, status updates, and free-text fields.

Also detect and locate with bounding boxes:
- Email addresses
- Phone numbers
- Physical/mailing addresses (street, city, state, zip)
- Social Security Numbers or national ID numbers
- Credit card or financial account numbers
- Dates of birth
- IP addresses
- Any other personally identifiable information

For EACH piece of PII found, return a bounding box that TIGHTLY covers the text with NO extra whitespace.

Return the coordinates as [y_min, x_min, y_max, x_max] where each value is on a 0–1000 scale relative to the page dimensions. Origin is top-left corner.

For multi-page documents, specify which page (0-indexed) each detection belongs to.

Return ONLY a valid JSON array of objects. If no PII is found, return [].`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            text: {
              type: "STRING",
              description: "The exact PII text found",
            },
            type: {
              type: "STRING",
              description:
                "Category: NAME, EMAIL, PHONE, ADDRESS, SSN, CREDIT_CARD, DOB, IP_ADDRESS, OTHER",
            },
            page: {
              type: "INTEGER",
              description: "0-indexed page number where the PII appears",
            },
            box: {
              type: "ARRAY",
              description:
                "Bounding box as [y_min, x_min, y_max, x_max] in normalized 0-1000 coords",
              items: {
                type: "INTEGER",
              },
            },
          },
          required: ["text", "type", "page", "box"],
        },
      },
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(
      "Gemini bounding box detection error:",
      await res.text()
    );
    return [];
  }

  const json = await res.json();
  const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  try {
    const parsed = JSON.parse(reply);
    if (!Array.isArray(parsed)) return [];

    // Transform Gemini's [y_min, x_min, y_max, x_max] format into
    // our internal {x, y, w, h} format (still 0–1000 scale, top-left origin)
    return parsed
      .filter((d) => d.box && d.box.length === 4)
      .map((d) => ({
        text: d.text || "",
        type: d.type || "OTHER",
        page: typeof d.page === "number" ? d.page : 0,
        bbox: {
          x: d.box[1], // x_min
          y: d.box[0], // y_min
          w: d.box[3] - d.box[1], // x_max - x_min
          h: d.box[2] - d.box[0], // y_max - y_min
        },
      }));
  } catch (e) {
    console.error("Failed to parse bounding box response:", e.message);
    return [];
  }
}

/**
 * Sends extracted document text to Gemini and asks it to return a flat JSON array
 * of exact string phrases/words to redact (e.g. ["Vishal Sindhi", "Joydeep"]).
 */
export async function geminiExtractPIIPhrases(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set – skipping PII phrase extraction");
    return [];
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a strict document redaction engine. Identify sensitive values that should be hidden before sharing an invoice, form, or business document.

Return ONLY exact substrings from the source text. Prefer the smallest complete sensitive value, not labels or nearby words.

Redact:
- Personal names, including sender/recipient/contact names and colleague names mentioned inline.
- Organization, customer, vendor, account holder, or project names only when they identify a private transaction party or private project.
- Email addresses, phone numbers, street/mailing addresses, customer/account identifiers, SSNs, EIN/tax IDs, national IDs, credit card or bank-account numbers, dates of birth, and IP addresses.

Do NOT redact:
- Generic labels, headings, departments, occupational titles, table headers, dates that are ordinary invoice/service dates, currency amounts, public agency names, template/vendor attribution, product names, copyright lines, or boilerplate website/footer text.
- Words adjacent to a sensitive value. If the text is "Winthrop Project Manager", return "Winthrop" only and leave "Project Manager" visible.
- Partial substrings that would corrupt non-sensitive text. Return "WILDFLOWER VISTA" rather than "WILDFLOWER VISTA H"; return "Vertex42.com" only if it is actually a private party/contact, not template attribution.

Return a valid JSON array of strings. Each string must be an exact substring of the text. If no sensitive value is present, return [].
Example output: ["Vishal Sindhi", "Joydeep", "123 Main St", "vishal@cubyl.com", "12-3456789"]

Text to analyze:
---
${text}
---`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "STRING",
        },
      },
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Gemini PII phrase extraction error:", await res.text());
    return [];
  }

  const json = await res.json();
  const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  try {
    const parsed = JSON.parse(reply);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
