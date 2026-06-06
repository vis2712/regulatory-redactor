# RedactorAI — Zero-Retention PII Redaction Tool

A privacy-first micro-SaaS that automatically detects and redacts Personally Identifiable Information (PII) from PDFs and images. Built with a zero-retention architecture — your files are never stored.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Drag-and-drop upload** — Single PDF
- **Dual-layer redaction pipeline**:
  - ⚡ **Regex engine** — Instant detection of emails, phone numbers, SSNs, credit cards, IP addresses
  - 🤖 **Gemini 2.5 Flash AI** — Contextual detection of names, addresses, job titles
- **Visual split preview** — Side-by-side original vs. sanitized document
- **One-click download** — Get a clean, redacted PDF
- **Zero retention** — Files are processed in-memory and deleted immediately
- **SEO pages** — Dynamic `/tools/[slug]` routes for organic traffic
- **Dark mode** — Premium teal-blue design system

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| PDF Parsing | pdf-parse |
| PDF Generation | pdf-lib |
| AI Engine | Google Gemini 2.5 Flash API |
| File Handling | In-memory + `/tmp` staging |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/regulatory-redactor.git
cd regulatory-redactor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
regulatory-redactor/
├── app/
│   ├── api/
│   │   └── redact/
│   │       ├── route.js              # Main POST endpoint (redaction pipeline)
│   │       ├── download/
│   │       │   └── route.js          # GET endpoint (serve & delete redacted PDF)
│   │       └── utils/
│   │           ├── regexRedact.js     # Regex-based PII pattern matching
│   │           ├── geminiClient.js    # Gemini API client (vision + text)
│   │           ├── pdfUtils.js        # PDF generation with redaction boxes
│   │           └── fileHelpers.js     # Temp file management
│   ├── tools/
│   │   ├── seoData.js                # SEO page content & metadata
│   │   └── [slug]/
│   │       └── page.js               # Dynamic SEO pages
│   ├── globals.css                   # Tailwind v4 theme & animations
│   ├── layout.js                     # Root layout with dark mode
│   └── page.js                       # Main landing page + tool UI
├── .env.example                      # Environment variable template
├── postcss.config.mjs                # PostCSS with @tailwindcss/postcss
├── package.json
└── README.md
```

## 🧪 Testing

### Manual Test

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Upload a PDF containing test PII data (e.g., emails, phone numbers, SSNs)
4. Observe the progress animation and split preview
5. Click "Download Redacted PDF"
6. Open the downloaded file — redacted content should show black boxes

### API Test with curl

```bash
# Upload and redact a PDF
curl -X POST http://localhost:3000/api/redact \
  -F "file=@test-document.pdf" \
  | jq .

# Download the redacted result
curl "http://localhost:3000/api/redact/download?id=YOUR_DOWNLOAD_ID" \
  -o redacted-output.pdf
```

### Verify Zero Retention

```bash
# After downloading, check that no temp files remain
ls /tmp/redactor-* 2>/dev/null && echo "FAIL: temp files found" || echo "PASS: no temp files"
```

## 🔒 Security & Privacy

- All files are stored only in `/tmp` and deleted immediately after processing
- No user accounts, cookies, or tracking
- No payment gateway — free to use
- Gemini API calls send only extracted text (not the original file) for PII detection
- The source code is fully auditable

## 📄 SEO Pages

The following SEO-optimized pages are available:

| Path | Target Keyword |
|------|---------------|
| `/tools/how-to-black-out-text-in-pdf` | How to black out text in PDF |
| `/tools/remove-social-security-number-from-pdf` | Remove SSN from PDF |
| `/tools/redact-pii-from-pdf-online` | Redact PII from PDF online |

Add more slugs in `app/tools/seoData.js`.

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## 📝 License

MIT — feel free to fork, improve, and deploy.

---

**Built with privacy in mind. Your data stays yours.**
