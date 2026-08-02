"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  drawClusterLabel,
  drawCornerBrackets,
  drawStar,
  drawThreads,
  fitCanvas,
  findNearestStar,
  layoutStars,
  type PositionedStar,
} from "@/lib/starfield";
import type { Cluster, Film } from "@/lib/types";

interface SkyCanvasProps {
  films: Film[];
  clusters: Cluster[];
  height: number;
  seed?: number;
  color?: string;
  showFrame?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  /** When set, clicking a specimen navigates to /film/[id] instead of doing nothing. */
  navigable?: boolean;
}

export function SkyCanvas({
  films,
  clusters,
  height,
  seed = 42,
  color = "#a97c2f",
  showFrame = false,
  showLabels = false,
  interactive = false,
  navigable = false,
}: SkyCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<PositionedStar<Film>[]>([]);
  const [hovered, setHovered] = useState<PositionedStar<Film> | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const render = () => {
      const width = container.getBoundingClientRect().width;
      const ctx = fitCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      if (showFrame) drawCornerBrackets(ctx, width, height);
      const stars = layoutStars(films, clusters, width, height, seed);
      starsRef.current = stars;
      drawThreads(ctx, stars, "rgba(92,107,69,0.35)", seed + 1);
      if (showLabels) {
        for (const cluster of clusters) {
          drawClusterLabel(ctx, cluster.x * width - 30, cluster.y * height - 34, cluster.label, cluster.mood);
        }
      }
      for (const star of stars) {
        drawStar(ctx, star, color, star.item.rating >= 4);
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [films, clusters, height, seed, color, showFrame, showLabels]);

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
          className="pointer-events-none absolute z-10 whitespace-nowrap border border-line bg-paper-deep px-2 py-1 font-mono text-[10.5px] text-ink shadow-sm"
          style={{ left: Math.min(hoverPos.x + 9, 9999), top: Math.max(hoverPos.y - 26, 0) }}
        >
          {hovered.item.title}
          <span className="ml-1.5 text-brass">{hovered.item.rating}/5</span>
        </div>
      )}
    </div>
  );
}
