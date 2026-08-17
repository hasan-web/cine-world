import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_URL = "https://loveforcinema.com";
const SITE_NAME = "Love for Cinema";
const DESCRIPTION =
  "Love for Cinema's keepsake program for what you've watched — Constellation logs each film as a specimen in your own personal sky, placed by how it felt, not its genre.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Constellation`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Constellation`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — Constellation` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Constellation`,
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
