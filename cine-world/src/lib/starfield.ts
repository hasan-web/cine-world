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
 * A glowing point of light — soft shadow-blur halo, brighter and larger once `bright` (rating
 * ≥ 4 or coincident with a friend's placement). `scale` (default 1) shrinks and fades the mark —
 * used to animate a just-logged star settling into place; values above 1 (a brief overshoot) are
 * allowed for the settle's bounce, but alpha itself is clamped at full opacity.
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  star: PositionedStar,
  color: string,
  bright = false,
  scale = 1,
  dim = false,
) {
  const r = star.r * Math.max(scale, 0) * (bright ? 1.15 : 1);
  ctx.save();
  ctx.globalAlpha = (dim ? 0.15 : 1) * Math.min(1, Math.max(scale, 0));
  ctx.shadowColor = color;
  ctx.shadowBlur = dim ? 3 : bright ? 16 : 7;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A faint thread connecting each star to its nearest same-cluster neighbor. When `activeCluster`
 * is set, threads outside that cluster fade back so the highlighted mood reads clearly.
 */
export function drawThreads(
  ctx: CanvasRenderingContext2D,
  stars: PositionedStar[],
  color: string,
  seed: number,
  activeCluster?: ClusterId | null,
) {
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
    ctx.globalAlpha = activeCluster != null && star.item.cluster !== activeCluster ? 0.12 : 1;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo((star.x + neighbor.x) / 2 + jx, (star.y + neighbor.y) / 2 + jy);
    ctx.lineTo(neighbor.x, neighbor.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Cluster label set as mood name over its common-name gloss. Colors are passed in, resolved from
 * CSS custom properties by the caller, so labels stay correct across light and dark mode. */
export function drawClusterLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  gloss: string,
  primaryColor: string,
  secondaryColor: string,
) {
  ctx.font = "600 11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = primaryColor;
  ctx.fillText(name.toUpperCase(), x, y);
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = secondaryColor;
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
