export const seoPages = {
  "how-to-black-out-text-in-pdf": {
    title: "How to Black Out Text in a PDF — Free Online Tool",
    description:
      "Learn how to permanently black out sensitive text in PDF documents using our free, zero-retention AI-powered redaction tool. GDPR & CCPA compliant.",
    heading: "How to Black Out Text in a PDF",
    content: `Blacking out text in a PDF is essential for protecting sensitive information before sharing documents. Whether you're a legal professional preparing court filings, an HR manager sharing employee records, or a compliance officer handling regulated data, proper redaction ensures that confidential information stays hidden — permanently.

**Why simple highlighting doesn't work:**
Many users make the mistake of placing black rectangles over text in a PDF editor. This is NOT true redaction — the underlying text data remains in the file and can be extracted. True redaction removes the data entirely.

**How RedactorAI handles it:**
Our tool processes your PDF through a multi-layer pipeline:

1. **Structural Pattern Detection** — Our regex engine instantly identifies emails, phone numbers, SSNs, credit card numbers, and IP addresses.
2. **AI-Powered Contextual Analysis** — Gemini 2.5 Flash analyzes the full document context to find names, physical addresses, job titles, and other PII that patterns alone can't catch.
3. **Permanent Redaction** — We rebuild the PDF with redacted content, ensuring the original data is completely removed from the output file.

**Zero retention guarantee:** Your file is processed in-memory and deleted immediately after you download the result. Nothing is ever stored on our servers.`,
  },

  "remove-social-security-number-from-pdf": {
    title: "Remove Social Security Numbers from PDFs — Automated SSN Redaction",
    description:
      "Automatically detect and remove Social Security Numbers (SSNs) from PDF documents. Fast, accurate, zero-retention processing. Free online tool.",
    heading: "Remove Social Security Numbers from PDFs",
    content: `Social Security Numbers (SSNs) are among the most sensitive pieces of personally identifiable information. Accidentally sharing a document containing SSNs can lead to identity theft, regulatory fines, and legal liability.

**The challenge with SSNs:**
SSNs follow a recognizable pattern (XXX-XX-XXXX), but they can appear in various formats:
- Standard: 123-45-6789
- Without dashes: 123456789
- Partial: ***-**-6789

**How RedactorAI detects SSNs:**
Our regex engine uses a carefully tuned pattern to catch SSNs in standard format with near-zero false positives. The AI layer provides an additional safety net, catching SSNs in non-standard formats or those mentioned in surrounding context (e.g., "her social is 123456789").

**Compliance context:**
- **CCPA** requires businesses to protect SSNs and provides consumers the right to request deletion.
- **GLBA** mandates financial institutions safeguard SSNs.
- **State laws** (e.g., California, New York, Texas) have specific SSN protection requirements.

Upload your PDF above to automatically find and redact all SSNs in seconds.`,
  },

  "redact-pii-from-pdf-online": {
    title: "Redact PII from PDF Online — Free AI-Powered Privacy Tool",
    description:
      "Free online tool to automatically redact personally identifiable information (PII) from PDF documents and images. AI-powered, GDPR & CCPA ready.",
    heading: "Redact PII from PDF Online",
    content: `Personally Identifiable Information (PII) includes any data that can be used to identify a specific individual. Leaving PII in documents you share, publish, or archive creates serious privacy and compliance risks.

**What counts as PII?**
- Names (full name, maiden name, aliases)
- Contact information (email, phone, physical address)
- Government IDs (SSN, passport, driver's license)
- Financial data (credit card numbers, bank accounts)
- Digital identifiers (IP addresses, device IDs)
- Professional context (job titles paired with names)

**Our redaction pipeline:**
RedactorAI uses a dual-layer approach for maximum coverage:

| Layer | What it catches | Speed |
|-------|----------------|-------|
| **Regex Engine** | Emails, phones, SSNs, credit cards, IPs | Instant |
| **Gemini AI** | Names, addresses, job titles, contextual PII | ~2 seconds |

**Supported file formats:**
- PDF documents (text-based and scanned)

**Privacy-first architecture:**
- All processing happens in-memory
- Files are deleted immediately after download
- No user accounts or tracking required
- No data is sent to third parties (except the Gemini API for AI analysis)

Try it now — upload your document above to see the redaction preview before downloading.`,
  },

  "redact-freelance-invoice-online": {
    title: "Redact Freelance Invoices Online — Secure PDF Redactor",
    description:
      "Protect client confidentiality under GDPR. Redact client names, internal project codes, and coworker details from freelance invoices before sharing.",
    heading: "Redact Freelance Invoices Online",
    content: `Protecting client confidentiality is critical for freelancers and independent contractors. When sharing work summaries, project details, or invoicing templates as portfolios, accidentally exposing private client names, internal project codes, or coworker email addresses can violate NDAs and breach privacy regulations like GDPR.

**Why Freelancers Trust RedactorAI:**
- **NDA Compliance**: Hide internal company names, colleague email addresses, and specific project names easily before publishing your portfolio or case study.
- **Free & Fast**: Redact in seconds without paying for complex PDF editing software.
- **Zero Retention**: Your invoice files are processed in-memory and deleted instantly. We never save your data.`,
  },

  "redact-court-document-online-free": {
    title: "Redact Court Documents Online Free — Legal Document Redactor",
    description:
      "Fast, secure redaction tool for paralegals and legal clerks. Redact witness names, personal information, and SSNs from legal filings. CCPA compliant.",
    heading: "Redact Court Documents & Legal Filings",
    content: `Paralegals, legal clerks, and attorneys regularly handle sensitive court exhibits and case discovery files. Court rules require strict redaction of Personally Identifiable Information (PII) before filings become public record.

**Legal Redaction Standards Met:**
- **Witness & Minor Names**: Automatically mask names and personal identifiers in the document.
- **Secure Text Stripping**: Completely deletes metadata and underlying text layers so the information cannot be recovered by search engines or copy-paste.
- **Fast File Processing**: Sanitize document discovery batches instantly without a premium software subscription.`,
  },

  "redact-bank-statement-for-mortgage": {
    title: "Redact Bank Statements for Mortgage Application — Secure Redactor",
    description:
      "Mask account numbers, financial details, and transaction history on bank statements before sharing with mortgage brokers or real estate agents.",
    heading: "Redact Bank Statements for Mortgage Application",
    content: `When applying for a mortgage or rental property, real estate agents and financial brokers require bank statements. However, sharing unredacted statements exposes account numbers, sensitive transaction histories, and daily balances.

**Protect Financial Privacy:**
- **Mask Account Numbers**: Redact bank details, routing numbers, and balances you don't wish to share.
- **Broker & Underwriter Ready**: Mask sensitive details while keeping necessary verification figures intact.
- **Privacy First**: Files are processed in-memory and wiped from the server as soon as the session closes.`,
  },
};
