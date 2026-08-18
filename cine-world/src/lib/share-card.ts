import { drawStar, drawThreads, layoutStars } from "@/lib/starfield";
import type { Cluster, PlacedFilm } from "@/lib/types";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

export interface ShareCardStats {
  totalFilms: number;
  totalRewatches: number;
  topMood: { label: string; pct: number } | null;
}

/**
 * Draws the whole shareable card in one pass — background, the person's real sky, and their real
 * numbers. Deliberately a fixed dark palette rather than following the visitor's light/dark
 * preference: this becomes a static downloaded image, not live themed UI, and the constellation
 * motif reads better against dark regardless of which mode someone was in when they exported it.
 *
 * No identifying information is drawn on it on purpose — no email, no name. The app doesn't have
 * public profiles, and a downloadable image is the last place that should start.
 */
export function drawShareCard(
  ctx: CanvasRenderingContext2D,
  films: PlacedFilm[],
  clusters: Cluster[],
  stats: ShareCardStats,
) {
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;

  // Background: the app's own dark body gradient, hardcoded rather than read from CSS since this
  // must render identically regardless of the exporting visitor's theme.
  const bg = ctx.createRadialGradient(w * 0.2, -h * 0.1, 0, w * 0.2, -h * 0.1, w * 1.3);
  bg.addColorStop(0, "#141a2e");
  bg.addColorStop(1, "#05070d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const gold = "#f0cb7c";
  const goldDim = "#b6935a";
  const ink = "#f3f4f8";
  const inkSoft = "#a6abc0";

  // Header.
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = goldDim;
  ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("LOVE FOR CINEMA", 72, 108);
  ctx.fillStyle = ink;
  ctx.font = "600 48px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("My sky", 72, 168);

  // The sky itself, laid out with the exact same function the real interactive sky uses — this
  // is a real rendering of their real collection, not an illustration standing in for it.
  const skyTop = 230;
  const skyHeight = 760;
  const skyStars = layoutStars(films, clusters, w, skyHeight, 42).map((s) => ({ ...s, y: s.y + skyTop }));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, skyTop, w, skyHeight);
  ctx.clip();
  drawThreads(ctx, skyStars, "rgba(255,255,255,0.14)", 43);
  for (const star of skyStars) {
    drawStar(ctx, star, gold, star.item.rating >= 4);
  }
  ctx.restore();

  // Cluster labels, so the shape reads as "mood-based" even out of context.
  ctx.font = "600 15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = inkSoft;
  ctx.textAlign = "left";
  for (const cluster of clusters) {
    const lx = cluster.x * w;
    const ly = cluster.y * skyHeight + skyTop;
    ctx.fillText(cluster.label.toUpperCase(), Math.min(lx + 14, w - 160), ly - 14);
  }

  // Stat row.
  const statsY = skyTop + skyHeight + 90;
  const stat = (x: number, value: string, label: string) => {
    ctx.textAlign = "left";
    ctx.fillStyle = ink;
    ctx.font = "600 44px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(value, x, statsY);
    ctx.fillStyle = inkSoft;
    ctx.font = "13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(label.toUpperCase(), x, statsY + 30);
  };
  stat(72, String(stats.totalFilms), "Films");
  stat(72 + w / 3, String(stats.totalRewatches), "Rewatched");
  if (stats.topMood) {
    stat(72 + (w / 3) * 2, `${Math.round(stats.topMood.pct * 100)}%`, stats.topMood.label);
  }

  // A hairline separates the stats from the footer, then the footer itself — the actual growth
  // loop: whoever sees this card downstream sees where it came from.
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(72, statsY + 70);
  ctx.lineTo(w - 72, statsY + 70);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = goldDim;
  ctx.font = "600 16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("loveforcinema.com", w / 2, h - 64);
}
