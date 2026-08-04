import { mulberry32 } from "@/lib/rng";
import type { Cluster, ClusterId } from "@/lib/types";

/** The minimum shape layout needs — a `Film` satisfies this, but so does an anonymous commons placement. */
export interface StarLike {
  id: string;
  cluster: ClusterId;
  rating: number;
}

export interface PositionedStar<T extends StarLike = StarLike> {
  item: T;
  x: number;
  y: number;
  r: number;
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Scatters each film around its cluster's anchor point. Position is derived from the film's own
 * id (not array order), so the same film always lands at the same spot for a given seed — which is
 * what lets two people's collections show a shared film as a single coincident specimen rather than
 * two nearby ones.
 */
export function layoutStars<T extends StarLike>(
  items: T[],
  clusters: Cluster[],
  w: number,
  h: number,
  seed: number,
): PositionedStar<T>[] {
  const byCluster = new Map(clusters.map((c) => [c.id, c]));
  return items.map((item) => {
    const cluster = byCluster.get(item.cluster);
    const anchorX = cluster ? cluster.x * w : w / 2;
    const anchorY = cluster ? cluster.y * h : h / 2;
    const rnd = mulberry32(hashString(item.id) ^ seed);
    const angle = rnd() * Math.PI * 2;
    const radius = rnd() * Math.min(w, h) * 0.2;
    return {
      item,
      x: anchorX + Math.cos(angle) * radius,
      y: anchorY + Math.sin(angle) * radius,
      r: 1.6 + (item.rating / 5) * 2.8,
    };
  });
}

export function findNearestStar<T extends StarLike>(
  stars: PositionedStar<T>[],
  x: number,
  y: number,
  maxDistance = 16,
): PositionedStar<T> | null {
  let nearest: PositionedStar<T> | null = null;
  let best = maxDistance;
  for (const star of stars) {
    const d = Math.hypot(star.x - x, star.y - y);
    if (d < best) {
      best = d;
      nearest = star;
    }
  }
  return nearest;
}

/**
 * A pressed specimen: ink-outlined circle, gilt-filled and ringed once rating reaches 4/5.
 * `scale` (default 1) shrinks and fades the mark — used to animate a just-logged star settling
 * into place; values above 1 (a brief overshoot) are allowed for the settle's bounce, but alpha
 * itself is clamped at full opacity.
 */
export function drawStar(ctx: CanvasRenderingContext2D, star: PositionedStar, color: string, gilt = false, scale = 1) {
  const r = star.r * Math.max(scale, 0);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = gilt ? color : "#5a4d3e";
  ctx.fillStyle = gilt ? `${color}29` : "rgba(90,77,62,0.08)";
  ctx.globalAlpha = Math.min(1, Math.max(scale, 0));
  ctx.beginPath();
  ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (gilt) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(star.x, star.y, r + 2.5 * Math.max(scale, 0), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** A moss-green stem connecting each specimen to its nearest same-cluster neighbor, like sprigs on one branch. */
export function drawThreads(ctx: CanvasRenderingContext2D, stars: PositionedStar[], color: string, seed: number) {
  const rnd = mulberry32(seed);
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6;
  for (const star of stars) {
    const neighbor = stars
      .filter((o) => o !== star && o.item.cluster === star.item.cluster)
      .sort((a, b) => Math.hypot(a.x - star.x, a.y - star.y) - Math.hypot(b.x - star.x, b.y - star.y))[0];
    if (!neighbor) continue;
    const jx = (rnd() - 0.5) * 3;
    const jy = (rnd() - 0.5) * 3;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo((star.x + neighbor.x) / 2 + jx, (star.y + neighbor.y) / 2 + jy);
    ctx.lineTo(neighbor.x, neighbor.y);
    ctx.stroke();
  }
}

/** Deco corner brackets standing in for an engraved program-page border. */
export function drawCornerBrackets(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const size = 22;
  const inset = 14;
  ctx.strokeStyle = "rgba(169,124,47,0.55)";
  ctx.lineWidth = 1.5;
  const corners: [number, number, number, number][] = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - inset, 1, -1],
    [w - inset, h - inset, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * dy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size * dx, y);
    ctx.stroke();
  }
}

/** Cluster label set as Latin name over its common-name gloss, matching a specimen-sheet caption. */
export function drawClusterLabel(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, gloss: string) {
  ctx.font = "600 12px Jost, sans-serif";
  ctx.fillStyle = "rgba(107,32,39,0.75)";
  ctx.fillText(name.toUpperCase(), x, y);
  ctx.font = "italic 11px 'Libre Baskerville', serif";
  ctx.fillStyle = "rgba(90,77,62,0.65)";
  ctx.fillText(gloss, x, y + 15);
}

/** Sizes and scales a canvas for the device pixel ratio; call again on resize. */
export function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.scale(dpr, dpr);
  return ctx;
}
