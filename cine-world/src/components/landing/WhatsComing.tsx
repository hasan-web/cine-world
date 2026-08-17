import type { ReactNode } from "react";
import { PlateFrame } from "@/components/atlas/PlateFrame";

interface ComingSoonPlateProps {
  title: string;
  caption: string;
  children: ReactNode;
}

function ComingSoonPlate({ title, caption, children }: ComingSoonPlateProps) {
  return (
    <PlateFrame title={title} padded caption={<><em>Coming soon.</em> {caption}</>}>
      {children}
    </PlateFrame>
  );
}

function MarginNotesPreview() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" className="flex-none">
        <circle cx="26" cy="26" r="8" fill="var(--glass-strong)" stroke="var(--accent)" strokeWidth="1.2" />
        <circle cx="26" cy="26" r="12" fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity="0.7" />
      </svg>
      <div className="min-w-[220px] flex-1">
        <p className="text-[16px] italic">Aftersun</p>
        <p className="mb-3 font-mono text-[9.5px] tracking-[0.06em] text-ink-soft uppercase">Charlotte Wells · 2022</p>
        <div className="relative max-w-[320px] -rotate-1 border border-line bg-glass-strong px-4 py-3">
          <span className="absolute -top-1.5 left-5 h-2 w-2 rounded-full bg-accent-strong/70" />
          <p className="text-[14.5px] italic leading-snug">watched this the week I moved out.</p>
        </div>
      </div>
    </div>
  );
}

function SeasonsPreview() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return {
      x1: 100 + Math.cos(angle) * 50,
      y1: 80 + Math.sin(angle) * 50,
      x2: 100 + Math.cos(angle) * 55,
      y2: 80 + Math.sin(angle) * 55,
    };
  });
  const dots: Array<[number, number, number]> = [
    [100, 32, 3], [88, 40, 2.5], [148, 62, 3], [138, 48, 2],
    [70, 112, 3.5], [104, 126, 3], [52, 82, 2.5], [60, 100, 3],
  ];
  return (
    <div className="flex justify-center">
      <svg width="200" height="160" viewBox="0 0 200 160" aria-hidden="true">
        <circle cx="100" cy="80" r="50" fill="none" stroke="var(--line)" strokeWidth="1" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--line-strong)" strokeWidth="1" />
        ))}
        {dots.map((d, i) => (
          <circle key={i} cx={d[0]} cy={d[1]} r={d[2]} fill="var(--accent)" opacity="0.85" />
        ))}
        <text x="100" y="77" textAnchor="middle" className="font-mono" fontSize="10" fill="var(--ink)">
          38 films
        </text>
        <text x="100" y="91" textAnchor="middle" className="font-mono" fontSize="10" fill="var(--ink-soft)">
          across 11 months
        </text>
      </svg>
    </div>
  );
}

function ConstellationsPreview() {
  return (
    <svg width="100%" viewBox="0 0 420 150" aria-hidden="true">
      <line x1="60" y1="60" x2="150" y2="30" stroke="var(--line-strong)" strokeWidth="0.8" opacity="0.4" />
      <line x1="70" y1="120" x2="220" y2="130" stroke="var(--line-strong)" strokeWidth="0.8" opacity="0.4" />
      <path d="M150 30 Q265 28 380 70" stroke="var(--accent-strong)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <text x="195" y="18" className="italic" fontSize="10.5" fill="var(--accent-strong)">
        this reminds me of that
      </text>
      {[
        [60, 60, 4],
        [150, 30, 5],
        [280, 45, 4],
        [380, 70, 4],
        [70, 120, 4],
        [220, 130, 5],
        [340, 120, 4],
      ].map((s, i) => (
        <g key={i}>
          <circle cx={s[0]} cy={s[1]} r={s[2]} fill="var(--glass-strong)" stroke="var(--accent)" strokeWidth="1.2" />
          <circle cx={s[0]} cy={s[1]} r={s[2] + 4} fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

function FirstLightPreview() {
  return (
    <div className="flex flex-wrap justify-center gap-10">
      <div className="text-center">
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
          <g stroke="var(--accent)" strokeWidth="1" opacity="0.85">
            <line x1="40" y1="4" x2="40" y2="14" />
            <line x1="40" y1="66" x2="40" y2="76" />
            <line x1="4" y1="40" x2="14" y2="40" />
            <line x1="66" y1="40" x2="76" y2="40" />
            <line x1="14" y1="14" x2="20" y2="20" />
            <line x1="66" y1="14" x2="60" y2="20" />
            <line x1="14" y1="66" x2="20" y2="60" />
            <line x1="66" y1="66" x2="60" y2="60" />
          </g>
          <circle cx="40" cy="40" r="8" fill="var(--glass-strong)" stroke="var(--accent-strong)" strokeWidth="1.4" />
          <circle cx="40" cy="40" r="12" fill="none" stroke="var(--accent-strong)" strokeWidth="0.8" opacity="0.7" />
        </svg>
        <p className="mt-1 font-mono text-[10px] text-accent-strong">first light · 0 others yet</p>
      </div>
      <div className="text-center">
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="8" fill="var(--glass-strong)" stroke="var(--accent)" strokeWidth="1.2" />
          <circle cx="40" cy="40" r="12" fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity="0.6" />
        </svg>
        <p className="mt-1 font-mono text-[10px] text-ink-soft">12 others have logged this one</p>
      </div>
    </div>
  );
}

function TasteDriftPreview() {
  const years: Array<{ year: string; dots: Record<"tl" | "tr" | "bl" | "br", number> }> = [
    { year: "2023", dots: { tl: 2, tr: 1, bl: 1, br: 5 } },
    { year: "2024", dots: { tl: 2, tr: 2, bl: 2, br: 4 } },
    { year: "2025", dots: { tl: 2, tr: 2, bl: 4, br: 2 } },
    { year: "2026", dots: { tl: 1, tr: 2, bl: 5, br: 1 } },
  ];
  const offsets: Record<"tl" | "tr" | "bl" | "br", Array<[number, number]>> = {
    tl: [[-16, -16], [-8, -22], [-20, -7]],
    tr: [[16, -16], [8, -22], [20, -7]],
    bl: [[-16, 16], [-8, 22], [-20, 7]],
    br: [[16, 16], [8, 22], [20, 7]],
  };
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {years.map((y) => (
        <div key={y.year} className="text-center">
          <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
            <line x1="0" y1="32" x2="64" y2="32" stroke="var(--line-strong)" strokeWidth="1" />
            <line x1="32" y1="0" x2="32" y2="64" stroke="var(--line-strong)" strokeWidth="1" />
            {(["tl", "tr", "bl", "br"] as const).flatMap((quad) =>
              Array.from({ length: y.dots[quad] }, (_, i) => {
                const off = offsets[quad][i % offsets[quad].length];
                return (
                  <circle key={`${quad}-${i}`} cx={32 + off[0]} cy={32 + off[1]} r="2.4" fill="var(--accent)" opacity="0.85" />
                );
              }),
            )}
          </svg>
          <p className="mt-1 font-mono text-[9.5px] text-ink-soft">{y.year}</p>
        </div>
      ))}
    </div>
  );
}

export function WhatsComing() {
  return (
    <div className="mb-16 border-t border-line pt-8">
      <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-accent uppercase">In the works</p>
      <p className="mb-8 max-w-[58ch] text-[14px] leading-[1.75] text-ink-soft">
        Five things we&rsquo;re building next. These are sketches, not screenshots — but this is the direction.
      </p>
      <div className="flex flex-col gap-10">
        <ComingSoonPlate
          title="margin notes"
          caption="a note you can come back and change later — because what a film meant to you rarely holds still."
        >
          <MarginNotesPreview />
        </ComingSoonPlate>
        <ComingSoonPlate
          title="seasons"
          caption="your year as a ring — the months you were watching heavily, and the ones where a single mood took over."
        >
          <SeasonsPreview />
        </ComingSoonPlate>
        <ComingSoonPlate
          title="constellations you've drawn"
          caption="draw a line between two films for a reason only you can explain. No mood, no genre — just your own private logic."
        >
          <ConstellationsPreview />
        </ComingSoonPlate>
        <ComingSoonPlate
          title="first light"
          caption="a quiet mark for when you're the first person here to log a film. No leaderboard, no points — just a small flag that you got there first."
        >
          <FirstLightPreview />
        </ComingSoonPlate>
        <ComingSoonPlate
          title="taste drift"
          caption="the same four moods, one snapshot per year, so you can watch your whole taste drift across time."
        >
          <TasteDriftPreview />
        </ComingSoonPlate>
      </div>
    </div>
  );
}
