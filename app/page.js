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
  AlertTriangle,
  AlertCircle,
  Search,
  Plus,
  X,
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

const MANUAL_PIPELINE_STEPS = [
  { key: "upload", label: "Uploading document…" },
  { key: "extract", label: "Extracting text content…" },
  { key: "regex", label: "Scanning structural patterns…" },
  { key: "ai", label: "AI entity recognition in progress…" },
  { key: "analyze", label: "Analyzing word occurrences…" },
  { key: "preview", label: "Generating initial preview…" },
  { key: "done", label: "Analysis complete" },
];

function ProgressSteps({ currentStep, mode }) {
  const steps = mode === "manual" ? MANUAL_PIPELINE_STEPS : PIPELINE_STEPS;
  return (
    <div className="w-full max-w-2xl mx-auto mt-10 space-y-3">
      {steps.map((step, i) => {
        const stepIndex = steps.findIndex(
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

  // New States for Smart/Manual modes
  const [redactionMode, setRedactionMode] = useState(null); // 'smart' | 'manual' | null
  const [showModeModal, setShowModeModal] = useState(false);
  const [redactionItems, setRedactionItems] = useState([]);
  const [initialDetectedItems, setInitialDetectedItems] = useState([]);
  const [textStrings, setTextStrings] = useState([]); // Array of { str, page }
  const [searchQuery, setSearchQuery] = useState("");
  const [newWord, setNewWord] = useState("");
  const [updatingPreview, setUpdatingPreview] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'warning' | 'error' }

  // Helper defined as a callback to avoid rendering loops
  const fetchRedactedPdf = useCallback(async (selectedFile, targets) => {
    const form = new FormData();
    form.append("file", selectedFile);
    form.append("action", "redact");
    form.append("targets", JSON.stringify(targets));

    const res = await fetch("/api/redact", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      let errMessage = "Redaction failed";
      try {
        const errData = await res.json();
        errMessage = errData.error || errMessage;
      } catch {}
      throw new Error(errMessage);
    }

    return await res.blob();
  }, []);

  useEffect(() => {
    return () => {
      if (redactedBlobUrl) URL.revokeObjectURL(redactedBlobUrl);
    };
  }, [redactedBlobUrl]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debounced preview sync for manual mode
  useEffect(() => {
    if (redactionMode !== "manual" || processing || !file) return;

    // Get active targets (enabled)
    const activeTargets = redactionItems
      .filter((item) => item.enabled)
      .map((item) => item.word);

    const delayDebounce = setTimeout(async () => {
      setUpdatingPreview(true);
      try {
        const previewBlob = await fetchRedactedPdf(file, activeTargets);
        const url = URL.createObjectURL(previewBlob);
        setRedactedBlobUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return url;
        });
      } catch (err) {
        console.error("Preview sync error:", err);
        setToast({ message: "Failed to update preview PDF.", type: "error" });
      } finally {
        setUpdatingPreview(false);
      }
    }, 600); // 600ms debounce as suggested for larger files/good UX

    return () => {
      clearTimeout(delayDebounce);
    };
  }, [redactionItems, redactionMode, file, processing, fetchRedactedPdf]);

  const handleFileReady = (selectedFile) => {
    // Validate
    const validTypes = ["application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF file.");
      setToast({ message: "Only PDF files are supported.", type: "error" });
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be under 20 MB.");
      setToast({ message: "File is too large (max 20 MB).", type: "error" });
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setShowModeModal(true);
  };

  const handleChooseMode = async (mode) => {
    setShowModeModal(false);
    setRedactionMode(mode);
    setProcessing(true);

    if (mode === "smart") {
      await runSmartRedaction(file);
    } else {
      await runManualAnalysis(file);
    }
  };

  const runSmartRedaction = async (selectedFile) => {
    setError(null);
    setResult(null);

    if (redactedBlobUrl) {
      URL.revokeObjectURL(redactedBlobUrl);
      setRedactedBlobUrl(null);
    }

    // Simulate progressive steps
    setCurrentStep("upload");
    await sleep(600);
    setCurrentStep("extract");
    await sleep(800);
    setCurrentStep("regex");
    await sleep(500);
    setCurrentStep("ai");

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
      setToast({ message: "Smart redaction complete!", type: "success" });
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setCurrentStep(null);
      setToast({ message: err.message || "Redaction failed.", type: "error" });
      setFile(null);
      setRedactionMode(null);
    } finally {
      setProcessing(false);
    }
  };

  const runManualAnalysis = async (selectedFile) => {
    setError(null);
    setResult(null);

    if (redactedBlobUrl) {
      URL.revokeObjectURL(redactedBlobUrl);
      setRedactedBlobUrl(null);
    }

    setCurrentStep("upload");
    await sleep(400);
    setCurrentStep("extract");
    await sleep(600);
    setCurrentStep("regex");
    await sleep(400);
    setCurrentStep("ai");

    try {
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("action", "analyze");

      const res = await fetch("/api/redact", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let errMessage = "Analysis failed";
        try {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const data = await res.json();

      setCurrentStep("analyze");
      await sleep(400);

      const items = data.detectedItems || [];
      setRedactionItems(items);
      setInitialDetectedItems(JSON.parse(JSON.stringify(items))); // Deep copy for Reset
      setTextStrings(data.textStrings || []);

      setCurrentStep("preview");

      const activeTargets = items.filter(item => item.enabled).map(item => item.word);
      const previewBlob = await fetchRedactedPdf(selectedFile, activeTargets);
      const url = URL.createObjectURL(previewBlob);
      setRedactedBlobUrl(url);

      setCurrentStep("done");
      await sleep(300);
      setToast({ message: "Analysis complete. Edit items in the sidebar.", type: "success" });
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setCurrentStep(null);
      setToast({ message: err.message || "Analysis failed.", type: "error" });
      setFile(null);
      setRedactionMode(null);
    } finally {
      setProcessing(false);
    }
  };

  // fetchRedactedPdf was moved to the top of the component to follow declaration order

  const handleAddNewWord = (e) => {
    e.preventDefault();
    const word = newWord.trim();

    if (!word) return;

    // Ignore very short custom entries (1-2 characters) to prevent accidental over-redaction
    if (word.length <= 2) {
      setToast({ message: "Custom entries must be at least 3 characters long.", type: "warning" });
      return;
    }

    const lowerWord = word.toLowerCase();

    // Prevent duplicate entries (ignore case differences)
    const exists = redactionItems.some(item => item.word.toLowerCase() === lowerWord);
    if (exists) {
      setToast({ message: `"${word}" is already in the redaction list.`, type: "warning" });
      return;
    }

    // Verify if the word exists in the PDF text layer case-insensitively
    let occurrences = 0;
    const pages = new Set();
    for (const item of textStrings) {
      if (!item.str) continue;
      const lowerStr = item.str.toLowerCase();
      let idx = -1;
      while ((idx = lowerStr.indexOf(lowerWord, idx + 1)) !== -1) {
        occurrences++;
        pages.add(item.page + 1); // 1-indexed page
      }
    }

    if (occurrences === 0) {
      setToast({ message: `Warning: "${word}" was not found in the document.`, type: "warning" });
      return;
    }

    const newItem = {
      word: word, // Keep user case
      occurrenceCount: occurrences,
      enabled: true,
      source: "manual",
      pages: Array.from(pages).sort((a, b) => a - b),
    };

    setRedactionItems(prev => [newItem, ...prev]);
    setNewWord("");
    setToast({ message: `Added "${word}" to redactions (${occurrences} matches).`, type: "success" });
  };

  const handleToggleItem = (word) => {
    setRedactionItems(prev => prev.map(item =>
      item.word === word ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const handleRemoveItem = (word) => {
    setRedactionItems(prev => prev.filter(item => item.word !== word));
    setToast({ message: `Removed "${word}" from list.`, type: "success" });
  };

  const handleReset = () => {
    setRedactionItems(JSON.parse(JSON.stringify(initialDetectedItems)));
    setToast({ message: "Reset to automatically detected words.", type: "success" });
  };

  const handleClearAll = () => {
    setRedactionItems([]);
    setToast({ message: "All redaction targets removed.", type: "success" });
  };

  const handleSelectAll = () => {
    setRedactionItems(prev => prev.map(item => ({ ...item, enabled: true })));
    setToast({ message: "Selected all items.", type: "success" });
  };

  const handleDeselectAll = () => {
    setRedactionItems(prev => prev.map(item => ({ ...item, enabled: false })));
    setToast({ message: "Deselected all items.", type: "success" });
  };

  const handleDownload = () => {
    if (!redactedBlobUrl) {
      setError("No download available. Please redact the document again.");
      setToast({ message: "No download available.", type: "error" });
      return;
    }

    try {
      const a = document.createElement("a");
      a.href = redactedBlobUrl;
      a.download = "redacted-document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setToast({ message: "Redacted PDF downloaded!", type: "success" });
    } catch (e) {
      console.error("Download error:", e);
      setError("Download failed. Please try again.");
      setToast({ message: "Download failed.", type: "error" });
    }
  };

  const handleResetToUpload = () => {
    if (redactedBlobUrl) URL.revokeObjectURL(redactedBlobUrl);
    setRedactedBlobUrl(null);
    setFile(null);
    setRedactionMode(null);
    setRedactionItems([]);
    setInitialDetectedItems([]);
    setTextStrings([]);
    setProcessing(false);
    setCurrentStep(null);
    setResult(null);
    setError(null);
    setSearchQuery("");
    setNewWord("");
  };

  const filteredItems = redactionItems.filter(item =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
          <div className={`
            flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-xl
            ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                : toast.type === "warning"
                ? "bg-amber-950/90 border-amber-500/30 text-amber-300"
                : "bg-red-950/90 border-red-500/30 text-red-300"
            }
          `}>
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            <span className="text-sm font-medium pr-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-surface-700 hover:text-surface-400 transition-colors p-0.5 ml-auto cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-md animate-[fadeInUp_0.2s_ease-out]">
          <div className="w-full max-w-lg rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowModeModal(false);
                setFile(null);
              }}
              className="absolute top-4 right-4 text-surface-700 hover:text-surface-400 transition-colors p-1 rounded-lg hover:bg-surface-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-surface-50 mb-2">
              Choose Redaction Mode
            </h3>
            <p className="text-sm text-surface-700 mb-6 leading-relaxed">
              Select how you would like to process <span className="font-semibold text-surface-200">{file?.name}</span>.
            </p>

            <div className="space-y-4">
              {/* Smart Mode Card */}
              <button
                onClick={() => handleChooseMode("smart")}
                className="w-full text-left p-5 rounded-xl border border-surface-800 bg-surface-950/40 hover:border-brand-500/50 hover:bg-surface-950/80 transition-all duration-300 group flex items-start gap-4 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-50 group-hover:text-brand-400 transition-colors mb-1">
                    Smart Redaction (Auto)
                  </h4>
                  <p className="text-xs text-surface-700 leading-relaxed">
                    Fully automated sanitization. Uses AI and structural patterns to instantly detect and black out sensitive data.
                  </p>
                </div>
              </button>

              {/* Manual Mode Card */}
              <button
                onClick={() => handleChooseMode("manual")}
                className="w-full text-left p-5 rounded-xl border border-surface-800 bg-surface-950/40 hover:border-brand-500/50 hover:bg-surface-950/80 transition-all duration-300 group flex items-start gap-4 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-50 group-hover:text-brand-400 transition-colors mb-1">
                    Manual Redaction (Interactive)
                  </h4>
                  <p className="text-xs text-surface-700 leading-relaxed">
                    Granular, interactive control. Review automatically detected words, toggle/remove individual instances, and add your own custom terms.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero / Editor Section ─── */}
      {redactionMode === "manual" && !processing ? (
        /* Manual Mode Editor View */
        <section className="relative overflow-hidden border-b border-surface-800/40 flex-1 flex flex-col min-h-0 bg-surface-950 py-8">
          <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col gap-6">
            
            {/* Editor Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-800/60 pb-4">
              <div>
                <h2 className="text-xl font-bold text-surface-50 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-400" />
                  Interactive Redaction Editor
                </h2>
                <p className="text-sm text-surface-700 mt-1">
                  Editing: <span className="font-semibold text-surface-300">{file?.name}</span> ({(file?.size / 1024).toFixed(1)} KB)
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {updatingPreview ? (
                  <span className="flex items-center gap-2 text-xs font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating preview...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_1.5s_infinite]" />
                    Preview synced
                  </span>
                )}
                
                <button
                  onClick={handleResetToUpload}
                  className="px-4 py-2 text-sm font-medium border border-surface-800 hover:border-surface-700 hover:bg-surface-900 rounded-lg text-surface-200 transition-colors cursor-pointer"
                >
                  Close Editor
                </button>
              </div>
            </div>

            {/* Editor Two-Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch min-h-[600px]">
              
              {/* Left Panel: PDF Viewer */}
              <div className="relative rounded-xl border border-surface-800 bg-surface-900/60 overflow-hidden flex flex-col h-full min-h-[580px]">
                <div className="px-4 py-3 border-b border-surface-800 bg-surface-900 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-brand-400" />
                    <span className="text-sm font-medium text-surface-200">Redacted Document Preview</span>
                  </div>
                  {updatingPreview && (
                    <span className="text-xs text-brand-300 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Synchronizing...
                    </span>
                  )}
                </div>
                
                <div className="flex-1 bg-surface-950 relative min-h-[520px]">
                  {redactedBlobUrl ? (
                    <object
                      data={`${redactedBlobUrl}#toolbar=1&navpanes=0`}
                      type="application/pdf"
                      className="w-full h-full min-h-[520px]"
                      style={{ minHeight: "520px" }}
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                        <FileText className="w-10 h-10 text-surface-700" />
                        <p className="text-sm text-surface-700">PDF preview unavailable in this browser.</p>
                        <a
                          href={redactedBlobUrl}
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
                  
                  {/* Sync Overlay */}
                  {updatingPreview && (
                    <div className="absolute inset-0 bg-surface-950/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-300">
                      <div className="px-4 py-3 rounded-xl bg-surface-900/90 border border-surface-800 flex items-center gap-3 shadow-2xl">
                        <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                        <span className="text-sm font-medium text-surface-100">Updating redaction masks...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Controls Sidebar */}
              <div className="rounded-xl border border-surface-800 bg-surface-900/40 p-5 flex flex-col h-full min-h-[580px] shadow-lg">
                <h3 className="font-semibold text-surface-50 text-base mb-4 flex items-center justify-between">
                  <span>Words & Phrases to Redact</span>
                  <span className="text-xs font-normal text-surface-700">
                    {redactionItems.filter(i => i.enabled).length} of {redactionItems.length} active
                  </span>
                </h3>

                {/* Add Custom Word */}
                <form onSubmit={handleAddNewWord} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom phrase (e.g. John Doe)..."
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-800 bg-surface-950/60 text-sm text-surface-100 placeholder-surface-700 focus:outline-none focus:border-brand-500/50 focus:bg-surface-950 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-medium text-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </form>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-700" />
                  <input
                    type="text"
                    placeholder="Search redactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-800 bg-surface-950/40 text-sm text-surface-100 placeholder-surface-700 focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700 hover:text-surface-400 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] border border-surface-800/60 rounded-xl bg-surface-950/40 p-2 pr-1 mb-4 space-y-2">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div
                        key={item.word}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                          ${
                            item.enabled
                              ? "bg-surface-900/80 border-surface-800/80 hover:bg-surface-900"
                              : "bg-surface-950/20 border-surface-900/40 opacity-60 hover:opacity-80"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => handleToggleItem(item.word)}
                            className="w-4 h-4 rounded border-surface-800 text-brand-500 focus:ring-brand-500/20 focus:ring-offset-surface-950 bg-surface-950 cursor-pointer"
                          />
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-surface-50 truncate max-w-[140px]" title={item.word}>
                                {item.word}
                              </span>
                              
                              {item.source === "ai" ? (
                                <span className="text-[9px] font-semibold text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded px-1.5 py-0.5 flex-shrink-0">
                                  AI
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 flex-shrink-0">
                                  Manual
                                </span>
                              )}

                              <span className="text-[10px] text-surface-700 bg-surface-900 px-1.5 py-0.5 rounded border border-surface-800 flex-shrink-0">
                                {item.occurrenceCount} {item.occurrenceCount === 1 ? 'match' : 'matches'}
                              </span>
                            </div>
                            
                            {item.pages && item.pages.length > 0 && (
                              <p className="text-[10px] text-surface-700 mt-1 truncate">
                                Page{item.pages.length === 1 ? '' : 's'}: {item.pages.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.word)}
                          className="text-surface-700 hover:text-red-400 p-1.5 rounded-lg hover:bg-surface-800/50 transition-all shrink-0 ml-2 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                      <FileText className="w-8 h-8 text-surface-800 mb-2" />
                      <p className="text-sm text-surface-700 font-medium">No items found</p>
                      <p className="text-xs text-surface-700 mt-1 px-4 max-w-xs leading-relaxed">
                        {searchQuery
                          ? "No words match your search criteria."
                          : "Type in custom phrases or upload a PDF containing auto-detected elements."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Toolbar */}
                <div className="border-t border-surface-800/80 pt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={handleSelectAll}
                      disabled={redactionItems.length === 0}
                      className="py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-surface-800 text-surface-200 hover:bg-surface-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      disabled={redactionItems.length === 0}
                      className="py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-surface-800 text-surface-200 hover:bg-surface-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      Deselect All
                    </button>
                    <button
                      onClick={handleReset}
                      className="py-2 text-xs font-semibold rounded-lg bg-surface-900 border border-surface-800 text-surface-200 hover:bg-surface-800 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleClearAll}
                      disabled={redactionItems.length === 0}
                      className="py-2 text-xs font-semibold rounded-lg border border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-950/20 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={updatingPreview || !redactedBlobUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-400 hover:to-brand-500 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 shadow-lg shadow-brand-950/30 mt-1 cursor-pointer"
                  >
                    {updatingPreview ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Redacted PDF
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </section>
      ) : (
        /* Standard Smart Mode / Upload Hero View */
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
                <UploadZone onFileReady={handleFileReady} disabled={processing} />
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
                <ProgressSteps currentStep={currentStep} mode={redactionMode} />
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
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-400 hover:to-brand-500 transition-all duration-300 cursor-pointer"
                    >
                      <Download className="w-4.5 h-4.5" />
                      Download Redacted PDF
                    </button>
                    <button
                      onClick={handleResetToUpload}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-surface-700 text-surface-200 hover:bg-surface-800 transition-colors font-medium cursor-pointer"
                    >
                      Redact Another File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Use Cases (Only visible when not in manual mode) ─── */}
      {redactionMode !== "manual" && (
        <section id="use-cases" className="py-16 border-b border-surface-800/40 bg-surface-950">
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
      )}

      {/* ─── Smart Mode Tool Result Preview ─── */}
      {result && redactedBlobUrl && redactionMode !== "manual" && (
        <section className="py-14 bg-surface-950">
          <div className="max-w-6xl mx-auto px-6">
            <RedactedPreview
              redactedBlobUrl={redactedBlobUrl}
              stats={result.stats}
            />
          </div>
        </section>
      )}

      {/* ─── Trust Bar (Only visible when not in manual mode) ─── */}
      {redactionMode !== "manual" && (
        <section className="py-12 border-t border-surface-800/40 bg-surface-950">
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
      )}

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-800/40 py-8 bg-surface-950">
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
