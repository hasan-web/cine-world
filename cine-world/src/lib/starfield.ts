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
 * allowed for the settle's bounce, but alpha itself is clamped at full opacity. `twinkle` (default
 * 1) is a separate multiplier for the idle brightness pulse — kept apart from `scale` since they
 * animate on different clocks and a settling star shouldn't also be twinkling mid-bounce.
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  star: PositionedStar,
  color: string,
  bright = false,
  scale = 1,
  dim = false,
  twinkle = 1,
) {
  const r = star.r * Math.max(scale, 0) * (bright ? 1.15 : 1);
  ctx.save();
  ctx.globalAlpha = (dim ? 0.15 : 1) * Math.min(1, Math.max(scale, 0)) * twinkle;
  ctx.shadowColor = color;
  ctx.shadowBlur = dim ? 3 : bright ? 16 : 7;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A per-star brightness multiplier that drifts slowly between ~0.7 and 1 on its own sine wave —
 * phase and speed seeded from the star's id, so a whole sky doesn't pulse in unison. Cheap: one
 * sine per star per frame, no allocation.
 */
export function twinkleFor(starId: string, elapsedMs: number): number {
  const seed = hashString(starId);
  const phase = (seed % 1000) / 1000 * Math.PI * 2;
  const speed = 0.00035 + (seed % 500) / 500 / 3500;
  return 0.78 + 0.22 * (0.5 + 0.5 * Math.sin(elapsedMs * speed + phase));
}

/** An expanding, fading ring — the outward pulse a star gives off the moment it settles into place. */
export function drawSettleRing(ctx: CanvasRenderingContext2D, star: PositionedStar, color: string, t: number) {
  if (t <= 0 || t >= 1) return;
  ctx.save();
  ctx.globalAlpha = 0.8 * (1 - t);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.r + t * 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * A faint thread connecting each star to its nearest same-cluster neighbor. When `activeCluster`
 * is set, threads outside that cluster fade back so the highlighted mood reads clearly, and
 * `revealProgress` (0-1, default 1) draws only that fraction of each active-cluster thread's
 * length — animated from the caller, this is what makes the constellation draw itself in rather
 * than snap to visible the instant a mood is hovered.
 */
export function drawThreads(
  ctx: CanvasRenderingContext2D,
  stars: PositionedStar[],
  color: string,
  seed: number,
  activeCluster?: ClusterId | null,
  revealProgress = 1,
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
    const isActive = activeCluster != null && star.item.cluster === activeCluster;
    ctx.globalAlpha = activeCluster != null && !isActive ? 0.12 : 1;
    const midX = (star.x + neighbor.x) / 2 + jx;
    const midY = (star.y + neighbor.y) / 2 + jy;
    const progress = isActive ? revealProgress : 1;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    if (progress >= 1) {
      ctx.lineTo(midX, midY);
      ctx.lineTo(neighbor.x, neighbor.y);
    } else if (progress > 0.5) {
      const segT = (progress - 0.5) * 2;
      ctx.lineTo(midX, midY);
      ctx.lineTo(midX + (neighbor.x - midX) * segT, midY + (neighbor.y - midY) * segT);
    } else {
      const segT = progress * 2;
      ctx.lineTo(star.x + (midX - star.x) * segT, star.y + (midY - star.y) * segT);
    }
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
