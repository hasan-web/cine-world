"use client";

import { useRef, useState } from "react";
import { CARD_HEIGHT, CARD_WIDTH, drawShareCard, type ShareCardStats } from "@/lib/share-card";
import type { Cluster, PlacedFilm } from "@/lib/types";

interface ShareCardProps {
  films: PlacedFilm[];
  clusters: Cluster[];
  stats: ShareCardStats;
}

/**
 * Renders the card entirely client-side onto a real <canvas> and hands the visitor a PNG via the
 * browser's own download mechanism — no server round trip, no image-generation service, nothing
 * that costs anything to run per-export. That's a deliberate choice over next/og: this app deploys
 * to Cloudflare Workers through OpenNext, where next/og is real but adds real weight to the Worker
 * bundle for a feature the browser can already do on its own.
 */
export function ShareCard({ films, clusters, stats }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CARD_WIDTH * dpr;
    canvas.height = CARD_HEIGHT * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawShareCard(ctx, films, clusters, stats);
    setReady(true);
  }

  function handleOpen() {
    setOpen(true);
    // The canvas element doesn't exist until this section renders, so drawing happens next tick.
    requestAnimationFrame(render);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-sky.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full border border-line-strong px-4 py-2 text-[12px] font-semibold text-ink-soft hover:border-accent/50 hover:text-ink"
      >
        Share your sky →
      </button>
    );
  }

  return (
    <div className="glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">Your sky, as an image</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-ink-faint hover:text-ink">
          Close
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "auto", aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}`, display: "block" }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="max-w-[42ch] text-[12px] leading-[1.6] text-ink-faint">
          Generated from your real collection, right in your browser — nothing is sent anywhere.
          Your email isn&rsquo;t on it.
        </p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!ready}
          className="flex-none rounded-full bg-gradient-to-br from-accent to-accent-strong px-5 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}
