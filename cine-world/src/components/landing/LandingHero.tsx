"use client";

import Link from "next/link";
import { type MouseEvent, useRef, useState } from "react";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import { FILMS } from "@/data/films";
import type { ClusterId } from "@/lib/types";

export function LandingHero() {
  const [pinned, setPinned] = useState<ClusterId | null>(null);
  const [hovered, setHovered] = useState<ClusterId | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const panelRef = useRef<HTMLDivElement>(null);

  const active = pinned ?? hovered;
  const activeMood = CLUSTERS.find((c) => c.id === active);

  function handlePanelMove(e: MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -5, ry: px * 5 });
  }

  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-14 sm:px-6 sm:pt-16 sm:pb-20">
      <div
        className="hero-blob hero-blob-a -top-32 -left-20 h-[420px] w-[420px]"
        style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
      />
      <div
        className="hero-blob hero-blob-b top-10 -right-24 h-[380px] w-[380px]"
        style={{ background: "radial-gradient(circle, var(--companion-glow), transparent 70%)" }}
      />
      <div
        className="hero-blob hero-blob-c bottom-[-140px] left-1/3 h-[320px] w-[320px]"
        style={{ background: "radial-gradient(circle, var(--star-glow), transparent 70%)" }}
      />

      <div className="relative mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="rise mb-4 text-[11px] tracking-[0.3em] text-accent uppercase">
            Love for Cinema
          </p>
          <h1
            className="rise mb-5 max-w-[15ch] text-[36px] leading-[1.1] font-semibold text-ink sm:text-[46px]"
            style={{ animationDelay: "90ms" }}
          >
            Nobody remembers what they rated it.
          </h1>
          <p className="rise mb-8 max-w-[46ch] text-[16px] leading-[1.75] text-ink-soft" style={{ animationDelay: "180ms" }}>
            You remember the walk home. You remember that nobody in the car said anything for ten minutes.
            Love for Cinema is a film diary built around that part — where a film actually sat with you, not the
            number you gave it on the way out.
          </p>
          <div className="rise mb-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "270ms" }}>
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-3 text-[13px] font-semibold text-white shadow-[0_10px_30px_var(--color-accent-soft)]"
            >
              Start your sky →
            </Link>
            <a
              href="#why-different"
              className="text-[13px] text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              Why it works like this
            </a>
          </div>

          <div className="rise flex flex-wrap gap-2" style={{ animationDelay: "360ms" }}>
            {CLUSTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setPinned((p) => (p === c.id ? null : c.id))}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
                  active === c.id
                    ? "border-accent bg-accent-soft font-semibold text-accent-strong"
                    : "border-line-strong text-ink-soft hover:border-accent/50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* The entrance animation lives on a wrapper, not the tilting panel itself — `rise` fills
            forwards to `transform: none`, which would otherwise pin the panel and kill the tilt. */}
        <div className="rise" style={{ animationDelay: "300ms" }}>
        <div
          ref={panelRef}
          onMouseMove={handlePanelMove}
          onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
          className="glass overflow-hidden"
          style={{
            transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: "transform 0.2s ease-out",
          }}
        >
          <SkyCanvas films={FILMS} clusters={CLUSTERS} height={360} showLabels interactive activeCluster={active} />
          <p className="border-t border-line px-6 py-4 text-[13px] leading-[1.7] text-ink-soft">
            {activeMood ? (
              <>
                <em className="font-semibold text-accent-strong not-italic">{activeMood.label}</em> —{" "}
                {activeMood.mood}. Hover a star to see which film it is.
              </>
            ) : (
              <>Someone else&rsquo;s sky, four years of it. Try a mood on the left, or hover a star.</>
            )}
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
