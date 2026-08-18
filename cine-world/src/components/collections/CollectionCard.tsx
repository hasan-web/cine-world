import Link from "next/link";
import type { Collection } from "@/lib/types";

/** A tiny deterministic scatter of dots so the same collection always looks the same, without
 * needing to know where its films actually sit — this card doesn't have mood positions to draw from. */
function seededDots(seed: string, count: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const shown = Math.min(count, 6);
  return Array.from({ length: shown }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    const x = 10 + (h % 120);
    h = (h * 1103515245 + 12345) >>> 0;
    const y = 6 + (h % 24);
    return { x, y, key: i };
  });
}

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const dots = seededDots(collection.id, collection.filmCount);

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="rounded-xl border border-line bg-glass-edge p-4 transition-colors hover:border-line-strong"
    >
      <svg width="100%" height="36" viewBox="0 0 140 36" aria-hidden="true">
        {dots.map((d) => (
          <circle key={d.key} cx={d.x} cy={d.y} r="2.6" fill="var(--star)" opacity="0.85" />
        ))}
      </svg>
      <p className="mt-2.5 truncate text-[13.5px] font-semibold text-ink">{collection.name}</p>
      <p className="mt-0.5 text-[11.5px] text-ink-faint">
        {collection.filmCount} film{collection.filmCount === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
