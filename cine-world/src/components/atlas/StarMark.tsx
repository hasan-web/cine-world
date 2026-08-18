import type { Cluster } from "@/lib/types";

interface StarMarkProps {
  cluster: Cluster;
  size?: number;
}

/**
 * A static, server-rendered stand-in for a poster on public movie pages — the app has no poster
 * images anywhere (that's deliberate, see the manifesto), so a film is represented the same way it
 * is everywhere else: a single star placed at its mood's real quadrant position in the sky.
 */
export function StarMark({ cluster, size = 120 }: StarMarkProps) {
  const px = cluster.x * 100;
  const py = cluster.y * 100;

  return (
    <div
      className="relative flex-none overflow-hidden rounded-2xl border border-line bg-glass-strong"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <line x1="50" y1="0" x2="50" y2="100" stroke="var(--line)" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--line)" strokeWidth="0.5" />
        <circle cx={px} cy={py} r="9" fill="none" stroke="var(--accent)" strokeWidth="0.7" opacity="0.5" />
        <circle cx={px} cy={py} r="5" fill="var(--glass-strong)" stroke="var(--accent)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
