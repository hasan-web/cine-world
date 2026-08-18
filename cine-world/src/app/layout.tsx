import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_URL = "https://loveforcinema.com";
const SITE_NAME = "Love for Cinema";
const DESCRIPTION =
  "Love for Cinema is a keepsake program for what you've watched — every film you log is placed by how it felt, not its genre, in your own personal sky.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — a mood-based film diary`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — a mood-based film diary`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — a mood-based film diary`,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Scroll-reveal starts content hidden and JS brings it in. Without JS nothing would ever
            undo that, so unhide everything up front for those readers. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col font-sans text-ink antialiased">
        <div className="flex-1">{children}</div>
        <footer className="flex flex-col items-center gap-1.5 py-8 text-center">
          <p className="font-mono text-[10.5px] tracking-[0.06em] text-ink-faint">
            © Love for Cinema {new Date().getFullYear()} — All rights reserved
          </p>
          <Link
            href="/manifesto"
            className="font-mono text-[10px] tracking-[0.04em] text-ink-faint underline decoration-line-strong underline-offset-4"
          >
            Why we built it this way
          </Link>
        </footer>
      </body>
    </html>
  );
}
