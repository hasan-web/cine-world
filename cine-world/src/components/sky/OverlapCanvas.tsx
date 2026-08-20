"use client";

import { useEffect, useRef } from "react";
import { drawStar, drawThreads, fitCanvas, layoutStars } from "@/lib/starfield";
import type { Cluster, PlacedFilm } from "@/lib/types";

interface OverlapCanvasProps {
  yourFilms: PlacedFilm[];
  theirFilms: PlacedFilm[];
  clusters: Cluster[];
  height: number;
}

const OVERLAP_SEED = 60;

/** Two decaying pulses on the coincident marks — draws the eye to the actual point of the overlap. */
function pulseScale(t: number): number {
  return 1 + 0.35 * Math.sin(t * Math.PI * 4) * (1 - t);
}

export function OverlapCanvas({ yourFilms, theirFilms, clusters, height }: OverlapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let rafId = 0;
    const theirIds = new Set(theirFilms.map((f) => f.id));
    const yourIds = new Set(yourFilms.map((f) => f.id));

    const styles = getComputedStyle(container);
    const yourColor = styles.getPropertyValue("--accent").trim() || "#b0812f";
    const theirColor = styles.getPropertyValue("--companion").trim() || "#5b7a9e";
    const coincidentColor = styles.getPropertyValue("--star").trim() || "#c9973f";
    const yourThreadColor = styles.getPropertyValue("--accent-soft").trim() || "rgba(176,129,47,0.2)";
    const theirThreadColor = styles.getPropertyValue("--companion-glow").trim() || "rgba(91,122,158,0.3)";

    const paint = (ctx: CanvasRenderingContext2D, width: number, coincidentScale: number) => {
      ctx.clearRect(0, 0, width, height);

      // Same seed on both sides so a film shared by both people lands at one exact point.
      const yours = layoutStars(yourFilms, clusters, width, height, OVERLAP_SEED);
      const theirs = layoutStars(theirFilms, clusters, width, height, OVERLAP_SEED);

      drawThreads(ctx, yours, yourThreadColor, 53);
      drawThreads(ctx, theirs, theirThreadColor, 54);

      for (const star of yours) {
        const shared = theirIds.has(star.item.id);
        const scale = shared ? coincidentScale : 1;
        drawStar(
          ctx,
          { ...star, r: shared ? star.r * 1.35 : star.r },
          shared ? coincidentColor : yourColor,
          shared || star.item.rating >= 4,
          scale,
        );
      }
      for (const star of theirs) {
        if (!yourIds.has(star.item.id)) drawStar(ctx, star, theirColor, star.item.rating >= 4);
      }
    };

    const render = () => {
      const width = container.getBoundingClientRect().width;
      const ctx = fitCanvas(canvas, width, height);
      const hasCoincident = yourFilms.some((f) => theirIds.has(f.id));
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (hasCoincident && !reduceMotion) {
        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          paint(ctx, width, pulseScale(t));
          if (t < 1) rafId = requestAnimationFrame(step);
        };
        rafId = requestAnimationFrame(step);
      } else {
        paint(ctx, width, 1);
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [yourFilms, theirFilms, clusters, height]);

  return (
    /* Canvas out of flow so its own pixel width can't pin the container open on resize — see the
       full explanation in SkyCanvas.tsx. */
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 block" />
    </div>
  );
}
