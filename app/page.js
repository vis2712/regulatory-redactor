"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  Shield,
  Zap,
  Eye,
  Download,
  Lock,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Globe,
  Trash2,
} from "lucide-react";

// ─── Upload Zone ───
function UploadZone({ onFileReady, disabled }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) onFileReady(file);
    },
    [onFileReady]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      className={`
        relative w-full rounded-2xl border-2 border-dashed p-8 sm:p-10
        flex flex-col items-center justify-center gap-5 cursor-pointer
        transition-all duration-300 ease-out group
        ${
          dragOver
            ? "border-brand-400 bg-brand-950/40 scale-[1.02] shadow-[0_0_40px_rgba(37,171,182,0.15)]"
            : "border-surface-700/60 bg-surface-900/50 hover:border-brand-500/50 hover:bg-surface-900/70"
        }
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center">
        <Upload className="w-8 h-8 text-brand-400 group-hover:scale-110 transition-transform duration-300" />
      </div>

      <div className="relative text-center">
        <p className="text-lg font-medium text-surface-50 mb-1">
          Drop a PDF or image here, or{" "}
          <label className="text-brand-400 hover:text-brand-300 underline underline-offset-4 cursor-pointer transition-colors">
            browse
            <input
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileReady(file);
              }}
              disabled={disabled}
            />
          </label>
        </p>
        <p className="text-sm text-surface-700 flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> PDF
          </span>
          <span className="text-surface-700/50">• Max 20 MB</span>
        </p>
      </div>
    </div>
  );
}

// ─── Progress Steps ───
const PIPELINE_STEPS = [
  { key: "upload", label: "Uploading document…" },
  { key: "extract", label: "Extracting text content…" },
  { key: "regex", label: "Running structural pattern scans…" },
  { key: "ai", label: "AI entity recognition in progress…" },
  { key: "render", label: "Rendering sanitization layers…" },
  { key: "done", label: "Redaction complete" },
];

function ProgressSteps({ currentStep }) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-10 space-y-3">
      {PIPELINE_STEPS.map((step, i) => {
        const stepIndex = PIPELINE_STEPS.findIndex(
          (s) => s.key === currentStep
        );
        const isDone = i < stepIndex;
        const isCurrent = i === stepIndex;
        const isPending = i > stepIndex;

        return (
          <div
            key={step.key}
            className="flex items-center gap-3"
            style={{
              animation: !isPending ? `slideIn 0.4s ease-out ${i * 0.1}s both` : "none",
            }}
          >
            <div className="flex-shrink-0">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-brand-400" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-brand-300 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-surface-700" />
              )}
            </div>
            <span
              className={`text-sm transition-all duration-300 ${
                isDone
                  ? "text-brand-400 font-medium"
                  : isCurrent
                  ? "text-surface-50 font-medium"
                  : "text-surface-700"
              }`}
            >
              {isDone ? step.label.replace("…", "") + " ✓" : step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── PDF Viewer Panel ───
function PdfViewerPanel({ blobUrl, label, icon: Icon, accentClass = "" }) {
  return (
    <div className={`rounded-xl border ${accentClass || "border-surface-800"} bg-surface-900/80 overflow-hidden flex flex-col`}>
      <div className={`px-4 py-3 border-b ${accentClass || "border-surface-800"} bg-surface-900 flex items-center gap-2 shrink-0`}>
        <Icon className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-medium text-surface-200">{label}</span>
      </div>
      <div className="flex-1 min-h-[520px] bg-surface-950">
        {blobUrl ? (
          <object
            data={`${blobUrl}#toolbar=1&navpanes=0`}
            type="application/pdf"
            className="w-full h-full min-h-[520px]"
            style={{ minHeight: "520px" }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <FileText className="w-10 h-10 text-surface-700" />
              <p className="text-sm text-surface-700">PDF preview unavailable in this browser.</p>
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-400 underline underline-offset-4 hover:text-brand-300"
              >
                Open PDF in new tab
              </a>
            </div>
          </object>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[520px]">
            <Loader2 className="w-6 h-6 text-surface-700 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

function RedactedPreview({ redactedBlobUrl, stats }) {
  return (
    <div
      className="w-full max-w-5xl mx-auto mt-10"
      style={{ animation: "fadeInUp 0.6s ease-out" }}
    >
      {stats && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 px-1">
          <div className="flex items-center gap-2 text-sm text-surface-200">
            <Shield className="w-4 h-4 text-brand-400" />
            <span>
              <span className="font-semibold text-brand-400">
                {stats.totalRedactions}
              </span>{" "}
              items redacted
            </span>
          </div>
          <span className="text-xs font-medium text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1">
            Ready to download
          </span>
        </div>
      )}

      <PdfViewerPanel
        blobUrl={redactedBlobUrl}
        label="Redacted Document"
        icon={Shield}
        accentClass="border-brand-800/30"
      />
    </div>
  );
}

// ─── Feature Card ───
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group relative rounded-xl border border-surface-800/60 bg-surface-900/40 p-6 hover:border-brand-500/30 hover:bg-surface-900/60 transition-all duration-300">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-brand-400" />
        </div>
        <h3 className="font-semibold text-surface-50 mb-2">{title}</h3>
        <p className="text-sm text-surface-700 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function Home() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [redactedBlobUrl, setRedactedBlobUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (redactedBlobUrl) URL.revokeObjectURL(redactedBlobUrl);
    };
  }, [redactedBlobUrl]);

  const handleFile = async (selectedFile) => {
    // Validate
    const validTypes = [
      "application/pdf"
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF file.");
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be under 20 MB.");
      return;
    }

    // Revoke any previous blob URLs to prevent memory leaks
    if (redactedBlobUrl) {
      URL.revokeObjectURL(redactedBlobUrl);
      setRedactedBlobUrl(null);
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setProcessing(true);

    // Simulate progressive steps
    setCurrentStep("upload");
    await sleep(600);
    setCurrentStep("extract");
    await sleep(800);
    setCurrentStep("regex");
    await sleep(500);
    setCurrentStep("ai");

    // Actually call the API
    try {
      const form = new FormData();
      form.append("file", selectedFile);

      const res = await fetch("/api/redact", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let errMessage = "Processing failed";
        try {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const redactedBlob = await res.blob();
      const totalRedactions = parseInt(res.headers.get("x-redacted-count") || "0", 10);
      const redUrl = URL.createObjectURL(redactedBlob);
      setRedactedBlobUrl(redUrl);

      setCurrentStep("render");
      await sleep(400);
      setCurrentStep("done");
      await sleep(300);

      setResult({
        stats: {
          totalRedactions,
          typeCounts: { "PII": totalRedactions },
        }
      });
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setCurrentStep(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!redactedBlobUrl) {
      setError("No download available. Please redact the document again.");
      return;
    }

    try {
      const a = document.createElement("a");
      a.href = redactedBlobUrl;
      a.download = "redacted-document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download error:", e);
      setError("Download failed. Please try again.");
    }
  };

  const handleReset = () => {
    if (redactedBlobUrl) URL.revokeObjectURL(redactedBlobUrl);
    setRedactedBlobUrl(null);
    setFile(null);
    setProcessing(false);
    setCurrentStep(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Nav ─── */}
      <nav className="border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-surface-50">
              Redactor<span className="text-brand-400">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#use-cases"
              className="text-surface-700 hover:text-surface-50 transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#tool"
              className="text-surface-700 hover:text-surface-50 transition-colors"
            >
              Redact Now
            </a>
            <Link
              href="/tools/redact-pii-from-pdf-online"
              className="px-4 py-2 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors font-medium"
            >
              Free Tools
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section id="tool" className="relative overflow-hidden border-b border-surface-800/40">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,171,182,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,171,182,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(37,171,182,0.08),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
              <Lock className="w-3.5 h-3.5" />
              Zero-retention redaction for regulated documents
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-50 leading-[1.08] mb-5">
              Black out sensitive PDF data without breaking the layout.
            </h1>

            <p className="text-lg text-surface-700 max-w-xl mb-7 leading-relaxed">
              Upload an invoice, legal packet, bank statement, or application
              file. The redactor detects private information and stamps precise
              black masks over the original document.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                ["No retention", "Files are processed in memory."],
                ["Layout-safe", "Tables and columns stay intact."],
                ["Per-document flow", "No account setup required."],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-xl border border-surface-800/70 bg-surface-900/40 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-surface-50">
                    {title}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-surface-700">
                    {body}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-surface-800/70 bg-surface-900/70 p-5 sm:p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-surface-50">
                  Redact a document
                </h2>
                <p className="mt-1 text-sm text-surface-700">
                  PDF. Max 20 MB.
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                <Upload className="w-5 h-5 text-brand-400" />
              </div>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!result && (
              <UploadZone onFileReady={handleFile} disabled={processing} />
            )}

            {file && !result && (
              <div className="mt-4 text-center text-sm text-surface-700">
                Processing:{" "}
                <span className="text-surface-200 font-medium">
                  {file.name}
                </span>{" "}
                ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}

            {processing && currentStep && (
              <ProgressSteps currentStep={currentStep} />
            )}

            {result && (
              <div className="rounded-xl border border-brand-800/30 bg-brand-950/30 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-brand-400" />
                  <div>
                    <div className="font-semibold text-surface-50">
                      Redaction complete
                    </div>
                    <div className="text-sm text-surface-700">
                      {result.stats.totalRedactions} sensitive item
                      {result.stats.totalRedactions === 1 ? "" : "s"} masked.
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-400 hover:to-brand-500 transition-all duration-300"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Download Redacted PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-surface-700 text-surface-200 hover:bg-surface-800 transition-colors font-medium"
                  >
                    Redact Another File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section id="use-cases" className="py-16 border-b border-surface-800/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-50 mb-3">
              Built for urgent one-off redaction jobs
            </h2>
            <p className="text-surface-700 max-w-xl mx-auto">
              A focused workflow for independent professionals and small teams
              that need clean, shareable files without a heavyweight PDF suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={Zap}
              title="Freelancers"
              description="Mask client names, colleague details, and confidential project references before sharing invoices or work logs."
            />
            <FeatureCard
              icon={Eye}
              title="Legal Clerks"
              description="Redact discovery snippets and small case packets quickly while preserving line spacing and tables."
            />
            <FeatureCard
              icon={Shield}
              title="Real Estate"
              description="Hide applicant names, addresses, IDs, and account values before forwarding files to processors."
            />
            <FeatureCard
              icon={Trash2}
              title="Financial Brokers"
              description="Black out SSNs, tax IDs, email addresses, and account numbers in application documents."
            />
          </div>
        </div>
      </section>

      {/* ─── Tool Section ─── */}
      {result && (
      <section className="py-14 bg-surface-950">
        <div className="max-w-6xl mx-auto px-6">
          <RedactedPreview
            redactedBlobUrl={redactedBlobUrl}
            stats={result.stats}
          />
        </div>
      </section>
      )}

      {/* ─── Trust Bar ─── */}
      <section className="py-12 border-t border-surface-800/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-brand-400" />
                <span className="text-2xl font-bold text-surface-50">
                  GDPR
                </span>
              </div>
              <p className="text-sm text-surface-700">
                EU General Data Protection Regulation ready
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-brand-400" />
                <span className="text-2xl font-bold text-surface-50">
                  CCPA
                </span>
              </div>
              <p className="text-sm text-surface-700">
                California Consumer Privacy Act compliant
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-brand-400" />
                <span className="text-2xl font-bold text-surface-50">
                  AU Privacy
                </span>
              </div>
              <p className="text-sm text-surface-700">
                Australian Privacy Act workflow friendly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-800/40 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-surface-200">
              RedactorAI
            </span>
          </div>
          <p className="text-sm text-surface-700">
            © {new Date().getFullYear()} RedactorAI. Zero-retention
            architecture. Your files are never stored.
          </p>
        </div>
      </footer>
    </div>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
