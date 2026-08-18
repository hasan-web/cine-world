import { mulberry32 } from "@/lib/rng";
import type { Cluster } from "@/lib/types";

interface StarMarkProps {
  cluster: Cluster;
  /** A stable per-film value (its slug works well) — the same seed always draws the same shape. */
  seed: string;
  size?: number;
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const POINT_COUNT = 4;

/**
 * A small, unique constellation standing in for a poster — the app doesn't use poster images
 * anywhere (see the manifesto: no poster grid, on purpose), so a film is represented the same way
 * it is everywhere else in the app: stars placed at its mood's quadrant. The scatter itself is a
 * pure function of `seed`, so the same film always draws the exact same shape and no two films draw
 * the same one — the closest thing to a "cover" this app has, without reproducing anyone's poster.
 */
export function StarMark({ cluster, seed, size = 120 }: StarMarkProps) {
  const hash = hashString(seed);
  const rnd = mulberry32(hash);
  const anchorX = cluster.x * 100;
  const anchorY = cluster.y * 100;

  const points = Array.from({ length: POINT_COUNT }, () => {
    const angle = rnd() * Math.PI * 2;
    const radius = 6 + rnd() * 13;
    return {
      x: Math.min(94, Math.max(6, anchorX + Math.cos(angle) * radius)),
      y: Math.min(94, Math.max(6, anchorY + Math.sin(angle) * radius)),
    };
  });
  const hub = points[points.length - 1];
  const filterId = `starmark-glow-${hash}`;

  return (
    <div
      className="relative flex-none overflow-hidden rounded-2xl border border-line bg-glass-strong"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
        </defs>
        <line x1="50" y1="0" x2="50" y2="100" stroke="var(--line)" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--line)" strokeWidth="0.5" />
        {points.slice(1).map((p, i) => (
          <line
            key={i}
            x1={points[i].x}
            y1={points[i].y}
            x2={p.x}
            y2={p.y}
            stroke="var(--line-strong)"
            strokeWidth="0.6"
            opacity="0.7"
          />
        ))}
        <circle cx={hub.x} cy={hub.y} r="8" fill="var(--star)" opacity="0.35" filter={`url(#${filterId})`} />
        {points.map((p, i) =>
          p === hub ? null : <circle key={i} cx={p.x} cy={p.y} r="2.2" fill="var(--star)" opacity="0.75" />,
        )}
        <circle cx={hub.x} cy={hub.y} r="4.5" fill="var(--glass-strong)" stroke="var(--star)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
