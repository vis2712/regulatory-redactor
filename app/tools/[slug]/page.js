import { seoPages } from "../seoData";
import { Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return Object.keys(seoPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = seoPages[slug];
  if (!page) return { title: "Not Found" };

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
    },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const page = seoPages[slug];
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-surface-950 text-surface-50">
      {/* Nav */}
      <nav className="border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Redactor<span className="text-brand-400">AI</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8 leading-tight">
          {page.heading}
        </h1>

        <div className="prose prose-invert prose-lg max-w-none text-surface-200 leading-relaxed space-y-4">
          {page.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return (
                <h2
                  key={i}
                  className="text-xl font-semibold text-surface-50 mt-8 mb-3"
                >
                  {paragraph.replace(/\*\*/g, "")}
                </h2>
              );
            }
            if (paragraph.startsWith("**")) {
              const [bold, ...rest] = paragraph.split("**").filter(Boolean);
              return (
                <h3
                  key={i}
                  className="text-lg font-semibold text-surface-100 mt-6 mb-2"
                >
                  {bold}
                </h3>
              );
            }
            if (paragraph.startsWith("- ") || paragraph.startsWith("1.")) {
              return (
                <div key={i} className="pl-4 space-y-1 text-surface-200">
                  {paragraph.split("\n").map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              );
            }
            if (paragraph.startsWith("|")) {
              return (
                <div
                  key={i}
                  className="overflow-x-auto rounded-lg border border-surface-800 my-4"
                >
                  <pre className="text-sm p-4 text-surface-200">{paragraph}</pre>
                </div>
              );
            }
            return (
              <p key={i} className="text-surface-200">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-brand-800/30 bg-brand-950/20 text-center">
          <h2 className="text-2xl font-bold text-surface-50 mb-3">
            Ready to Redact?
          </h2>
          <p className="text-surface-700 mb-6">
            Upload your document and see the results in seconds. No sign-up
            required.
          </p>
          <Link
            href="/#tool"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-400 hover:to-brand-500 transition-all duration-300 shadow-lg shadow-brand-500/20"
          >
            Start Redacting <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
