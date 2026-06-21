import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RedactorAI — Zero-Retention PII Redaction Tool",
  description:
    "Instantly detect and redact sensitive personal data (PII) from PDFs and images. Zero file retention, GDPR & CCPA ready. Free online tool.",
  keywords: [
    "redact PII",
    "PDF redaction",
    "remove SSN from PDF",
    "GDPR compliance",
    "privacy tool",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-surface-950 text-surface-50">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

