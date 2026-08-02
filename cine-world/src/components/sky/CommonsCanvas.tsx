"use client";

import { useEffect, useRef } from "react";
import { drawClusterLabel, drawCornerBrackets, drawStar, fitCanvas, layoutStars, type StarLike } from "@/lib/starfield";
import type { Cluster, ClusterId } from "@/lib/types";

interface CommonsCanvasProps {
  placements: { cluster: ClusterId; rating: number }[];
  /** The signed-in user's own placement of this film, if they've logged it — drawn as one bright point among the crowd. */
  yours?: { id: string; cluster: ClusterId; rating: number };
  clusters: Cluster[];
  height: number;
}

export function CommonsCanvas({ placements, yours, clusters, height }: CommonsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const anonymous: StarLike[] = placements.map((p, i) => ({
      id: `commons-${i}`,
      cluster: p.cluster,
      rating: p.rating,
    }));

    const render = () => {
      const width = container.getBoundingClientRect().width;
      const ctx = fitCanvas(canvas, width, height);
      ctx.clearRect(0, 0, width, height);
      drawCornerBrackets(ctx, width, height);

      for (const cluster of clusters) {
        drawClusterLabel(ctx, cluster.x * width - 30, cluster.y * height - 34, cluster.label, cluster.mood);
      }

      const cloud = layoutStars(anonymous, clusters, width, height, 71);
      for (const star of cloud) {
        drawStar(ctx, star, "#5a4d3e", false);
      }

      if (yours) {
        const [mine] = layoutStars([yours], clusters, width, height, 42);
        drawStar(ctx, { ...mine, r: mine.r * 1.3 }, "#a97c2f", true);
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [placements, yours, clusters, height]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
