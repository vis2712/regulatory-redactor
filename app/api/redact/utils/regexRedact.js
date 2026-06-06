// Baseline regex patterns for high-confidence PII detection
const patterns = [
  {
    type: "EMAIL",
    regex: /\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b/gi,
  },
  {
    type: "PHONE",
    regex: /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
  },
  {
    type: "SSN",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
  },
  {
    type: "TAX_ID",
    regex: /\b\d{2}-\d{7}\b/g,
  },
  {
    type: "CREDIT_CARD",
    regex: /\b(?:\d[ -]*?){13,16}\b/g,
  },
  {
    type: "IP_ADDRESS",
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  },
];

export function regexRedact(text) {
  let redacted = text;
  const matches = [];

  for (const p of patterns) {
    const found = text.match(p.regex);
    if (found) {
      for (const m of found) {
        matches.push({ text: m, type: p.type });
      }
    }
    redacted = redacted.replace(p.regex, `[REDACTED_${p.type}]`);
  }

  return { redacted, matches };
}
