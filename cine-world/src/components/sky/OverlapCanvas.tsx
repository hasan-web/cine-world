"use client";

import { useEffect, useRef } from "react";
import { drawCornerBrackets, drawStar, drawThreads, fitCanvas, layoutStars } from "@/lib/starfield";
import type { Cluster, Film } from "@/lib/types";

interface OverlapCanvasProps {
  yourFilms: Film[];
  theirFilms: Film[];
  clusters: Cluster[];
  height: number;
}

const OVERLAP_SEED = 60;

export function OverlapCanvas({ yourFilms, theirFilms, clusters, height }: OverlapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const theirIds = new Set(theirFilms.map((f) => f.id));
    const yourIds = new Set(yourFilms.map((f) => f.id));

    const render = () => {
      const width = container.getBoundingClientRect().width;
      const ctx = fitCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      drawCornerBrackets(ctx, width, height);

      // Same seed on both sides so a film shared by both people lands at one exact point.
      const yours = layoutStars(yourFilms, clusters, width, height, OVERLAP_SEED);
      const theirs = layoutStars(theirFilms, clusters, width, height, OVERLAP_SEED);

      drawThreads(ctx, yours, "rgba(92,107,69,0.3)", 53);
      drawThreads(ctx, theirs, "rgba(107,32,39,0.22)", 54);

      for (const star of yours) {
        const shared = theirIds.has(star.item.id);
        drawStar(ctx, { ...star, r: shared ? star.r * 1.35 : star.r }, shared ? "#e3b94d" : "#a97c2f", shared || star.item.rating >= 4);
      }
      for (const star of theirs) {
        if (!yourIds.has(star.item.id)) drawStar(ctx, star, "#6b2027", star.item.rating >= 4);
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [yourFilms, theirFilms, clusters, height]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
