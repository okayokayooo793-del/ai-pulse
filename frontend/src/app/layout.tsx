import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AI Pulse — Daily AI News",
  description: "Curated AI news from 40+ sources across X, YouTube, and the web. Bilingual (EN/中文), updated daily.",
  keywords: ["AI news", "artificial intelligence", "machine learning", "daily digest", "tech news"],
  openGraph: {
    title: "AI Pulse — Daily AI News",
    description: "Curated AI news from 40+ sources. Bilingual, updated daily.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
