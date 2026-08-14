import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WhatsComing } from "@/components/landing/WhatsComing";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import { FILMS } from "@/data/films";
import { getOptionalUser } from "@/lib/dal";

const DIFFERENTIATORS = [
  {
    label: "Mood, not genre",
    body: "You place each film yourself, in whichever of four moods it actually felt like — not a category a catalogue assigned it.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <line x1="16" y1="14" x2="28" y2="26" stroke="#5c6b45" strokeWidth="0.8" opacity="0.5" />
        <line x1="28" y1="26" x2="22" y2="40" stroke="#5c6b45" strokeWidth="0.8" opacity="0.5" />
        <line x1="28" y1="26" x2="42" y2="20" stroke="#5c6b45" strokeWidth="0.8" opacity="0.5" />
        <circle cx="16" cy="14" r="3" fill="#c99a3e29" stroke="#c99a3e" strokeWidth="1" />
        <circle cx="28" cy="26" r="4" fill="#c99a3e29" stroke="#c99a3e" strokeWidth="1" />
        <circle cx="22" cy="40" r="2.5" fill="#c99a3e29" stroke="#c99a3e" strokeWidth="1" />
        <circle cx="42" cy="20" r="3" fill="#c99a3e29" stroke="#c99a3e" strokeWidth="1" />
      </svg>
    ),
  },
  {
    label: "Rewatches don't overwrite",
    body: "Watch something again and it adds to the record rather than replacing your first verdict, so how your reading of a film moved stays visible.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <line x1="12" y1="28" x2="44" y2="28" stroke="rgba(43,32,24,0.14)" strokeWidth="1" />
        <circle cx="14" cy="28" r="2.5" fill="#c99a3e" opacity="0.45" />
        <circle cx="28" cy="28" r="3.2" fill="#c99a3e" opacity="0.7" />
        <circle cx="44" cy="28" r="4" fill="#c99a3e" />
      </svg>
    ),
  },
  {
    label: "Taste twins, made visible",
    body: "Overlay a friend's collection over yours. Where a film lands in exactly the same place for both of you, it glows — that's the overlap, not a percentage.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="22" cy="28" r="8" fill="none" stroke="#a97c2f" strokeWidth="1" opacity="0.55" />
        <circle cx="34" cy="28" r="8" fill="none" stroke="#6b2027" strokeWidth="1" opacity="0.55" />
        <circle cx="28" cy="28" r="3.5" fill="#e3b94d" stroke="#e3b94d" strokeWidth="1" />
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
    <main className="mx-auto max-w-[740px] px-7 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div className="mb-12 text-center">
        <p className="mb-2 font-mono text-[10px] tracking-[0.3em] text-brass uppercase">Love for Cinema</p>
        <h1 className="mb-2 font-display text-[13px] tracking-[0.4em] text-oxblood uppercase">Constellation</h1>
        <div className="mx-auto mb-5 h-px w-16 bg-brass" />
        <p className="mb-5 font-body text-[17px] italic text-ink-soft">a keepsake program for what you&rsquo;ve watched</p>
        <p className="mx-auto max-w-[56ch] border-t border-line-soft pt-4 text-left text-[15px] leading-[1.75] text-ink-soft">
          No poster grid, no star-out-of-five average pinned under a thumbnail. Every film you log is pressed
          into your own collection — its place set by how the film felt, its brightness by{" "}
          <span className="font-medium text-oxblood">how much it mattered</span>. Below is a sample sky, not
          yours yet.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative border border-line bg-paper-deep">
          <SkyCanvas films={FILMS} clusters={CLUSTERS} height={380} showFrame showLabels interactive />
        </div>
        <p className="mt-4 max-w-[60ch] text-[13.5px] leading-[1.75] text-ink-soft">
          A sample collection — <em className="text-ink not-italic font-medium">Solitudo</em> for the quiet,
          tense ones, <em className="text-ink not-italic font-medium">Amplitudo</em> for the epics,{" "}
          <em className="text-ink not-italic font-medium">Domus</em> for comfort watches,{" "}
          <em className="text-ink not-italic font-medium">Lacrima</em> for what wrecked you. Rest the cursor on
          a specimen to read it.
        </p>
      </div>

      <div className="mb-16 flex flex-col gap-7 border-t border-line-soft pt-8">
        {DIFFERENTIATORS.map((d) => (
          <div key={d.label} className="flex items-start gap-5">
            <div className="mt-0.5 flex h-14 w-14 flex-none items-center justify-center border border-line bg-paper-deep">
              {d.icon}
            </div>
            <div>
              <p className="mb-1 font-display text-[11px] tracking-[0.12em] text-oxblood uppercase">{d.label}</p>
              <p className="max-w-[58ch] text-[14px] leading-[1.75] text-ink-soft">{d.body}</p>
            </div>
          </div>
        ))}
      </div>

      <WhatsComing />

      <div className="border-t border-line-soft pt-8 text-center">
        <Link
          href="/login"
          className="font-mono text-[11px] tracking-[0.08em] text-oxblood uppercase underline decoration-oxblood/50 underline-offset-4"
        >
          Sign in and start your own →
        </Link>
        <p className="mt-4">
          <Link href="/manifesto" className="font-mono text-[10.5px] tracking-[0.06em] text-ink-soft underline decoration-line-soft underline-offset-4">
            Why we built it this way →
          </Link>
        </p>
      </div>
    </main>
  );
}
