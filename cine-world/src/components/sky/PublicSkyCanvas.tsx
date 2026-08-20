"use client";

import { useEffect, useRef, useState } from "react";
import {
  drawClusterLabel,
  drawStar,
  drawThreads,
  fitCanvas,
  findNearestStar,
  layoutStars,
  type PositionedStar,
} from "@/lib/starfield";
import type { Cluster } from "@/lib/types";
import type { PublicSkyStar } from "@/lib/films";

interface PublicSkyCanvasProps {
  stars: PublicSkyStar[];
  clusters: Cluster[];
  height: number;
}

/**
 * A trimmed sibling of SkyCanvas for the public /sky/[token] page. SkyCanvas's prop type is the
 * full Film shape (director, year, country, ...), which this page never has — the public RPC
 * behind it deliberately returns only id/title/cluster/rating, the same anonymized-of-everything-
 * else shape used everywhere else public data is shown. layoutStars only ever needed that narrower
 * shape anyway, so this reuses it and drawStar/drawThreads directly rather than stretching
 * SkyCanvas's stricter typing (or worse, inventing fake director/year values to satisfy it).
 *
 * Hover-only, deliberately no click-to-navigate: the film pages a click would target are behind
 * auth, so clicking here would just bounce a visitor to login.
 */
export function PublicSkyCanvas({ stars, clusters, height }: PublicSkyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<PositionedStar<PublicSkyStar>[]>([]);
  const [hovered, setHovered] = useState<PositionedStar<PublicSkyStar> | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const styles = getComputedStyle(container);
    const starColor = styles.getPropertyValue("--star").trim() || "#c9973f";
    const threadColor = styles.getPropertyValue("--line-strong").trim() || "rgba(0,0,0,0.16)";
    const labelPrimary = styles.getPropertyValue("--accent-strong").trim() || "#8f6a26";
    const labelSecondary = styles.getPropertyValue("--ink-soft").trim() || "#5b5f70";

    const render = () => {
      const width = container.getBoundingClientRect().width;
      const ctx = fitCanvas(canvas, width, height);
      const positioned = layoutStars(stars, clusters, width, height, 42);
      starsRef.current = positioned;

      ctx.clearRect(0, 0, width, height);
      drawThreads(ctx, positioned, threadColor, 43);
      for (const cluster of clusters) {
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
      for (const star of positioned) {
        drawStar(ctx, star, starColor, star.item.rating >= 4);
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [stars, clusters, height]);

  return (
    /* Canvas out of flow so its own pixel width can't pin the container open on resize — see the
       full explanation in SkyCanvas.tsx. */
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <canvas
        ref={canvasRef}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const nearest = findNearestStar(starsRef.current, e.clientX - rect.left, e.clientY - rect.top);
          setHovered(nearest);
          if (nearest) setHoverPos({ x: nearest.x, y: nearest.y });
        }}
        onMouseLeave={() => setHovered(null)}
        className="absolute top-0 left-0 block cursor-pointer"
      />
      {hovered && (
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
