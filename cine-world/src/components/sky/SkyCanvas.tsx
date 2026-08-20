"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  drawClusterLabel,
  drawSettleRing,
  drawStar,
  drawThreads,
  fitCanvas,
  findNearestStar,
  layoutStars,
  twinkleFor,
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

const SETTLE_DURATION = 650;
const REVEAL_DURATION = 550;

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
  const activeClusterRef = useRef<ClusterId | null>(activeCluster);
  const clusterChangedAtRef = useRef(0);
  const [hovered, setHovered] = useState<PositionedStar<PlacedFilm> | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Read via a ref inside the render loop instead of a dependency — hovering different moods
  // shouldn't tear down and rebuild the whole canvas pipeline below, just change what the
  // already-running loop paints. Only the transition moment is recorded, for the reveal animation.
  useEffect(() => {
    if (activeClusterRef.current !== activeCluster) clusterChangedAtRef.current = performance.now();
    activeClusterRef.current = activeCluster;
  }, [activeCluster]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let rafId = 0;
    let stopped = false;
    const mountedAt = performance.now();

    // Resolved from the live cascade, not hardcoded, so canvas painting tracks light/dark mode.
    const styles = getComputedStyle(container);
    const starColor = color ?? (styles.getPropertyValue("--star").trim() || "#c9973f");
    const threadColor = styles.getPropertyValue("--line-strong").trim() || "rgba(0,0,0,0.16)";
    const labelPrimary = styles.getPropertyValue("--accent-strong").trim() || "#8f6a26";
    const labelSecondary = styles.getPropertyValue("--ink-soft").trim() || "#5b5f70";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.getBoundingClientRect().width;
    let ctx = fitCanvas(canvas, width, height);
    let stars = layoutStars(films, clusters, width, height, seed);
    starsRef.current = stars;

    const relayout = () => {
      width = container.getBoundingClientRect().width;
      ctx = fitCanvas(canvas, width, height);
      stars = layoutStars(films, clusters, width, height, seed);
      starsRef.current = stars;
    };

    const paint = (now: number) => {
      const active = activeClusterRef.current;
      const revealElapsed = now - clusterChangedAtRef.current;
      const revealProgress = active == null || reduceMotion ? 1 : Math.min(1, revealElapsed / REVEAL_DURATION);

      const settleElapsed = now - mountedAt;
      const settling = !reduceMotion && newStarId && !hasAnimatedRef.current && settleElapsed < SETTLE_DURATION;
      const settleT = settling ? settleElapsed / SETTLE_DURATION : 1;
      const settleScale = settling ? easeOutBack(settleT) : 1;
      if (newStarId && settleElapsed >= SETTLE_DURATION && !hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        window.history.replaceState(null, "", window.location.pathname);
      }

      ctx.clearRect(0, 0, width, height);
      drawThreads(ctx, stars, threadColor, seed + 1, active, revealProgress);
      if (showLabels) {
        for (const cluster of clusters) {
          ctx.globalAlpha = active != null && cluster.id !== active ? 0.35 : 1;
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
        const isNew = star.item.id === newStarId;
        const scale = isNew ? settleScale : 1;
        const dim = active != null && star.item.cluster !== active;
        const twinkle = reduceMotion ? 1 : twinkleFor(star.item.id, now);
        drawStar(ctx, star, starColor, star.item.rating >= 4, scale, dim, twinkle);
        if (isNew && settling) drawSettleRing(ctx, star, starColor, settleT);
      }
    };

    if (reduceMotion) {
      paint(mountedAt);
    } else {
      const loop = (now: number) => {
        if (stopped) return;
        paint(now);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      relayout();
      if (reduceMotion) paint(performance.now());
    });
    observer.observe(container);

    return () => {
      stopped = true;
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [films, clusters, height, seed, color, showLabels, newStarId]);

  return (
    /*
     * The canvas is deliberately out of flow, and the container carries the height instead.
     *
     * fitCanvas() gives the canvas an explicit pixel width. While it was in flow that width became
     * its container's min-content, so the container could never shrink below the widest it had ever
     * been — the ResizeObserver above then kept re-measuring that stale width and the canvas
     * ratcheted: it grew with the viewport but never shrank back. On the landing page the canvas
     * and the hero copy share one grid track on mobile, so a stale desktop-width canvas held the
     * track open and the hero's overflow-hidden silently cropped the copy after a phone rotate.
     *
     * Positioned absolutely, the container's width depends only on its parent, so a resize measures
     * honestly and the loop can't form.
     */
    <div ref={containerRef} className="relative w-full" style={{ height }}>
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
        className={`absolute top-0 left-0 block ${navigable ? "cursor-pointer" : ""}`}
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
