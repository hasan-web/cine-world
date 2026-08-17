"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  drawClusterLabel,
  drawStar,
  drawThreads,
  fitCanvas,
  findNearestStar,
  layoutStars,
  type PositionedStar,
} from "@/lib/starfield";
import type { Cluster, ClusterId, PlacedFilm } from "@/lib/types";

interface SkyCanvasProps {
  /** Only placed films can be drawn — an unplaced one has no mood to position it by. */
  films: PlacedFilm[];
  clusters: Cluster[];
  height: number;
  seed?: number;
  /** Overrides the theme's star color — most callers should leave this alone. */
  color?: string;
  showLabels?: boolean;
  interactive?: boolean;
  /** When set, clicking a specimen navigates to /film/[id] instead of doing nothing. */
  navigable?: boolean;
  /** The id of a just-logged film — it settles into place with a brief animation instead of appearing instantly. */
  newStarId?: string;
  /** When set, specimens outside this cluster fade back so the chosen mood reads clearly. */
  activeCluster?: ClusterId | null;
}

/** A small overshoot-then-settle curve — the star grows past its final size before easing back, like it was pressed into place. */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function SkyCanvas({
  films,
  clusters,
  height,
  seed = 42,
  color,
  showLabels = false,
  interactive = false,
  navigable = false,
  newStarId,
  activeCluster = null,
}: SkyCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<PositionedStar<PlacedFilm>[]>([]);
  const hasAnimatedRef = useRef(false);
  const [hovered, setHovered] = useState<PositionedStar<PlacedFilm> | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let rafId = 0;

    // Resolved from the live cascade, not hardcoded, so canvas painting tracks light/dark mode.
    const styles = getComputedStyle(container);
    const starColor = color ?? (styles.getPropertyValue("--star").trim() || "#c9973f");
    const threadColor = styles.getPropertyValue("--line-strong").trim() || "rgba(0,0,0,0.16)";
    const labelPrimary = styles.getPropertyValue("--accent-strong").trim() || "#8f6a26";
    const labelSecondary = styles.getPropertyValue("--ink-soft").trim() || "#5b5f70";

    const paint = (ctx: CanvasRenderingContext2D, width: number, stars: PositionedStar<PlacedFilm>[], settleScale?: number) => {
      ctx.clearRect(0, 0, width, height);
      drawThreads(ctx, stars, threadColor, seed + 1, activeCluster);
      if (showLabels) {
        for (const cluster of clusters) {
          ctx.globalAlpha = activeCluster != null && cluster.id !== activeCluster ? 0.35 : 1;
          drawClusterLabel(
            ctx,
            cluster.x * width - 30,
            cluster.y * height - 34,
            cluster.label,
            cluster.mood,
            labelPrimary,
            labelSecondary,
          );
        }
        ctx.globalAlpha = 1;
      }
      for (const star of stars) {
        const scale = settleScale != null && star.item.id === newStarId ? settleScale : 1;
        const dim = activeCluster != null && star.item.cluster !== activeCluster;
        drawStar(ctx, star, starColor, star.item.rating >= 4, scale, dim);
      }
    };

    const render = () => {
      const width = container.getBoundingClientRect().width;
      const ctx = fitCanvas(canvas, width, height);
      const stars = layoutStars(films, clusters, width, height, seed);
      starsRef.current = stars;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shouldAnimate =
        newStarId && !hasAnimatedRef.current && !reduceMotion && stars.some((s) => s.item.id === newStarId);

      if (shouldAnimate) {
        hasAnimatedRef.current = true;
        const duration = 650;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          paint(ctx, width, stars, easeOutBack(t));
          if (t < 1) {
            rafId = requestAnimationFrame(step);
          } else {
            window.history.replaceState(null, "", window.location.pathname);
          }
        };
        rafId = requestAnimationFrame(step);
      } else {
        paint(ctx, width, stars);
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [films, clusters, height, seed, color, showLabels, newStarId, activeCluster]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        onMouseMove={
          interactive
            ? (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const nearest = findNearestStar(starsRef.current, x, y);
                setHovered(nearest);
                if (nearest) setHoverPos({ x: nearest.x, y: nearest.y });
              }
            : undefined
        }
        onMouseLeave={interactive ? () => setHovered(null) : undefined}
        onClick={
          navigable
            ? (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const nearest = findNearestStar(starsRef.current, x, y);
                if (nearest) router.push(`/film/${nearest.item.id}`);
              }
            : undefined
        }
        className={`block w-full ${navigable ? "cursor-pointer" : ""}`}
      />
      {interactive && hovered && (
        <div
          className="glass pointer-events-none absolute z-10 !rounded-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap text-ink"
          style={{ left: Math.min(hoverPos.x + 9, 9999), top: Math.max(hoverPos.y - 30, 0) }}
        >
          {hovered.item.title}
          <span className="ml-1.5 text-accent-strong">{hovered.item.rating}/5</span>
        </div>
      )}
    </div>
  );
}
