import type { Metadata } from "next";
import { Jost, Libre_Baskerville, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Jost({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const body = Libre_Baskerville({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Constellation`,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper text-ink font-body antialiased">
        <div className="flex-1">{children}</div>
        <footer className="py-8 text-center">
          <p className="font-mono text-[9.5px] tracking-[0.1em] text-ink-soft/60 uppercase">
            © Love for Cinema {new Date().getFullYear()} — All rights reserved
          </p>
        </footer>
      </body>
    </html>
  );
}
