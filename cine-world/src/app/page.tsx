import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { WhatsComing } from "@/components/landing/WhatsComing";
import { getOptionalUser } from "@/lib/dal";

const DIFFERENTIATORS = [
  {
    label: "Mood, not genre",
    body: "You place each film yourself, in whichever of four moods it actually felt like — not a category a catalogue assigned it.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <line x1="16" y1="14" x2="28" y2="26" stroke="var(--line-strong)" strokeWidth="0.8" />
        <line x1="28" y1="26" x2="22" y2="40" stroke="var(--line-strong)" strokeWidth="0.8" />
        <line x1="28" y1="26" x2="42" y2="20" stroke="var(--line-strong)" strokeWidth="0.8" />
        <circle cx="16" cy="14" r="3" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
        <circle cx="28" cy="26" r="4" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
        <circle cx="22" cy="40" r="2.5" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
        <circle cx="42" cy="20" r="3" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    label: "Rewatches don't overwrite",
    body: "Watch something again and it adds to the record rather than replacing your first verdict, so how your reading of a film moved stays visible.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <line x1="12" y1="28" x2="44" y2="28" stroke="var(--line)" strokeWidth="1" />
        <circle cx="14" cy="28" r="2.5" fill="var(--accent)" opacity="0.45" />
        <circle cx="28" cy="28" r="3.2" fill="var(--accent)" opacity="0.7" />
        <circle cx="44" cy="28" r="4" fill="var(--accent)" />
      </svg>
    ),
  },
  {
    label: "Taste twins, made visible",
    body: "Overlay a friend's collection over yours. Where a film lands in exactly the same place for both of you, it glows — that's the overlap, not a percentage.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="22" cy="28" r="8" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.55" />
        <circle cx="34" cy="28" r="8" fill="none" stroke="var(--companion)" strokeWidth="1" opacity="0.55" />
        <circle cx="28" cy="28" r="3.5" fill="var(--star)" stroke="var(--star)" strokeWidth="1" />
      </svg>
    ),
  },
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Love for Cinema",
  alternateName: "Constellation",
  url: "https://loveforcinema.com",
  description: "A keepsake program for what you've watched — log films as specimens in your own personal sky.",
};

export default async function LandingPage() {
  const user = await getOptionalUser();
  if (user) redirect("/collection");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <LandingHeader />
      <LandingHero />

      <main className="mx-auto max-w-[820px] px-6 pb-16 sm:px-10 sm:pb-20">
        <div id="why-different" className="mb-16 scroll-mt-24">
          <p className="mb-2 text-[11px] tracking-[0.2em] text-accent uppercase">Why it&rsquo;s different</p>
          <p className="mb-8 max-w-[58ch] text-[14px] leading-[1.75] text-ink-soft">
            Three decisions that separate Constellation from a plain film tracker.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {DIFFERENTIATORS.map((d) => (
              <div
                key={d.label}
                className="glass flex flex-col gap-4 px-6 py-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center">{d.icon}</div>
                <div>
                  <p className="mb-1.5 text-[13px] font-semibold text-accent-strong">{d.label}</p>
                  <p className="text-[13.5px] leading-[1.7] text-ink-soft">{d.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <WhatsComing />

        <div className="glass relative overflow-hidden px-6 py-12 text-center">
          <div
            className="hero-blob hero-blob-a -top-24 left-1/2 h-[280px] w-[280px] -translate-x-1/2"
            style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
          />
          <div className="relative">
            <p className="mx-auto mb-4 max-w-[36ch] text-[16px] leading-[1.6] text-ink">
              Your sky is empty until you press the first specimen into it.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-7 py-3 text-[12.5px] font-semibold text-white shadow-[0_10px_30px_var(--color-accent-soft)]"
            >
              Sign in and start your own →
            </Link>
            <p className="mt-4">
              <Link
                href="/manifesto"
                className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-4"
              >
                Why we built it this way →
              </Link>
            </p>
          </div>
        </div>
      </main>

      <div className="px-4 pb-4 sm:px-6">
        <LandingFooter />
      </div>
    </>
  );
}
