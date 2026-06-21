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

  "how-to-remove-ssn-from-pdf": {
    title: "How to Remove Social Security Numbers (SSN) from PDFs Online",
    description: "Learn how to safely and permanently redact Social Security Numbers (SSNs) from PDFs online. GDPR & CCPA compliant, zero file retention.",
    heading: "How to Remove Social Security Numbers (SSN) from PDFs",
    content: `Removing a Social Security Number (SSN) from a PDF is critical before sharing financial applications, tax forms, or background check authorizations. 

**Why simply drawing a black box doesn't work:**
Many basic PDF editors let you draw black shapes over text. However, this only hides it visually. The underlying text characters remain in the document and can easily be retrieved using copy-paste or text extraction scripts. 

**How to permanently redact SSNs with RedactorAI:**
1. **Upload your PDF**: Scroll to our redactor widget above and drop your file.
2. **Automatic Scan**: Our regex scanner immediately isolates standard SSN formats (e.g. XXX-XX-XXXX or XXXXXXXXX).
3. **Double-layer Sanitization**: We draw a black overlay box and strip the text metadata from the stream coordinates.
4. **Download**: Save the sanitized document. The file is immediately wiped from memory on our servers.`,
  },

  "gdpr-cv-sanitization-tool": {
    title: "GDPR Compliant CV Sanitization Tool — Secure Resume Redactor",
    description: "Anonymize resume and CV files online. Redact names, personal contact details, and locations to satisfy EU GDPR requirements. Zero-retention.",
    heading: "GDPR Compliant CV & Resume Sanitizer",
    content: `European recruitment agencies and HR consultants face strict GDPR penalties if candidates' personally identifiable data is shared without data minimization protocols.

**Redact Candidate PII for Compliance:**
- **Candidate Anonymization**: Hide candidate full names, personal phone numbers, emails, and address fields.
- **Maintain CV Layouts**: RedactorAI replaces characters while preserving tables and formatting so CVs remain easy to evaluate.
- **Zero Cloud Footprint**: Data is never archived or used for training. Ideal for satisfying internal security audits.`,
  },

  "black-out-tfn-in-pdf-online": {
    title: "Black Out TFN in PDF Online — Secure TFN Redactor Australia",
    description: "Black out Tax File Numbers (TFN) in PDFs for Australian compliance. Zero file retention. Secure, fast, and free online tool.",
    heading: "Black Out Tax File Numbers (TFN) in PDFs Online",
    content: `Under Australia's Privacy Act 1988, Tax File Numbers (TFNs) require strict protection rules. It is an offense to collect or store TFNs unless authorized.

**Sanitize Australian Financial Paperwork:**
- **Instant TFN Recognition**: Detects 9-digit Australian Tax File Numbers and stamps visual masks.
- **Completely Wiped**: The file is processed solely in-memory and deleted within seconds.
- **Compliance Ready**: Fully aligns with the Australian Privacy Principles (APPs).`,
  },

  "how-to-redact-a-pdf-without-adobe": {
    title: "How to Redact a PDF Without Adobe Acrobat (Free Online)",
    description: "Learn how to permanently redact sensitive text from PDF documents without needing a paid Adobe Acrobat subscription. Free, easy, and secure.",
    heading: "How to Redact a PDF Without Adobe Acrobat",
    content: `Adobe Acrobat Pro is the industry standard for document editing, but its premium subscription price can be prohibitive for individuals, freelancers, and small businesses who only need to redact occasionally.

**Why drawing boxes in free PDF viewers fails:**
Many users open a PDF in Microsoft Edge, Apple Preview, or a basic PDF reader and use the 'Draw' tool to sketch black blocks over text. This is a massive security hazard. The text layers remain fully searchable, and anyone can copy the underlying characters by simply highlighting the area and pressing Copy (Ctrl+C / Cmd+C).

**Free, secure alternatives without Adobe:**
- **Use RedactorAI**: Our zero-retention service completely strips the matching character data from the PDF stream and stamps black boxes.
- **Convert to Image**: Another manual method is printing the PDF as an image, drawing black boxes in an image editor, and exporting back to PDF. However, this degrades document quality and makes it unsearchable.
- **Automated AI Scan**: RedactorAI detects names, emails, and credit card numbers automatically so you don't have to scan line-by-line.`,
  },

  "how-to-blur-sensitive-information-in-pdf": {
    title: "How to Blur Sensitive Information in a PDF — Free Anonymizer",
    description: "Learn how to blur or black out sensitive text, images, and numbers in a PDF file securely. Complete data sanitization guide.",
    heading: "How to Blur Sensitive Information in a PDF",
    content: `Blurring or blacking out sensitive information is essential before publishing reports, sending legal exhibits, or submitting applications.

**Is blurring safe?**
In image editing, 'blur' filters (like Gaussian blur) can sometimes be digitally reversed if the filter radius is small. In PDFs, true 'blurring' of text does not exist as a standard feature. Instead, 'redaction' (completely replacing the text with a solid color mask) is the only secure method approved by government security agencies (such as the NSA).

**How to secure your files:**
- **Do not use highlight markers**: Standard yellow or black highlight tools in basic readers are transparent layers.
- **Stamp solid color masks**: Place absolute opaque black boxes over sensitive segments.
- **Sanitize underlying data**: Ensure the text generator stream deletes the characters completely. RedactorAI does this automatically in-memory.`,
  },

  "black-out-text-in-pdf-free-online": {
    title: "Black Out Text in PDF Free Online — Instant PDF Sanitizer",
    description: "Black out text in your PDF document for free online. Opaque masks, character stripping, and zero file retention. GDPR & CCPA ready.",
    heading: "Black Out Text in PDF Free Online",
    content: `Need to quickly black out text on an invoice, invoice statement, or identification document? Our free online tool allows you to sanitize files in seconds.

**Features of our Blackout Tool:**
- **Instant Setup**: No registration, email addresses, or payment details required.
- **Visual Editor**: Verify redactions in a live PDF preview before downloading the sanitized copy.
- **Multi-Word Select**: Toggle specific instances on and off or add custom search terms to redact them globally.
- **Permanent Masks**: The black boxes cannot be moved, selected, or deleted after export.`,
  },

  "how-to-hide-credit-card-number-in-pdf": {
    title: "How to Hide Credit Card Numbers in PDFs — PCI Compliance",
    description: "Automatically detect and hide credit card numbers (PAN) and billing details in PDF files to remain PCI-DSS compliant. Zero retention.",
    heading: "How to Hide Credit Card Numbers in PDFs",
    content: `Leaving Primary Account Numbers (PAN) or credit card details visible in emails, invoices, or customer receipts creates severe security exposures and violates PCI-DSS compliance regulations.

**Understanding PCI-DSS requirements:**
Any business storing, processing, or transmitting cardholder data must protect it. Card numbers must be masked, and card verification values (CVV) must never be stored.

**Automated credit card redaction:**
- **Regex Detection**: RedactorAI scans for 13-to-16 digit credit card patterns (Visa, Mastercard, Amex, Discover).
- **PCI Sanitization**: Automatically obscures the PAN numbers with absolute coordinate overlays.
- **No Residual Cache**: In-memory execution ensures that card details are never saved to a persistent server.`,
  },

  "how-to-anonymize-pdf-files-online": {
    title: "How to Anonymize PDF Files Online for Free — Secure Sanitizer",
    description: "Anonymize PDF documents online. Clean metadata, strip PII, and delete author names to create fully anonymous PDF files. Zero-retention.",
    heading: "How to Anonymize PDF Files Online for Free",
    content: `Anonymizing a PDF goes beyond blacking out text. PDFs contain metadata, author names, creation dates, and hidden object layers that can trace a file back to its creator.

**Step-by-Step PDF Anonymization Guide:**
1. **Clean metadata**: Wipe author information, software signatures, and edit histories.
2. **Sanitize visual text**: Mask names, addresses, ID numbers, and contact details.
3. **Strip content stream layers**: Make sure hidden text blocks (invisible text behind images) are completely stripped.

Our tool processes the file in memory, strips target text layers, and generates a clean layout structure. Try uploading your document above to review the preview.`,
  },

  "how-to-redact-email-address-in-pdf": {
    title: "How to Redact Email Addresses in a PDF Online — Free & Secure",
    description: "Automatically find and redact email addresses in PDF files online. Secure, fast, and free online tool with zero file retention.",
    heading: "How to Redact Email Addresses in a PDF Online",
    content: `Email addresses are frequently targeted by web scrapers and are protected as personal data under regulations like GDPR and CCPA. Sharing documents with exposed customer or employee emails poses a privacy risk.

**Automated Email Redaction:**
- **Pattern Matching**: Instantly finds any standard email address format (e.g. name@domain.com) across the document.
- **Global Replacement**: Checks every page and matches all occurrences.
- **Opaque Overlay**: Replaces the text layers with solid black masks.

Upload your PDF to automatically locate and redact all email addresses in your document.`,
  },
};
