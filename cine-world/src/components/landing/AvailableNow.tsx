import Link from "next/link";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { StarMark } from "@/components/atlas/StarMark";
import { CLUSTERS } from "@/data/clusters";
import { CATALOG } from "@/data/catalog";
import { Reveal } from "@/components/motion/Reveal";

const PREVIEW_COUNT = 6;

function MoviesPreview() {
  const featured = CATALOG.slice(0, PREVIEW_COUNT);
  return (
    <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
      {featured.map((film) => {
        const cluster = CLUSTERS.find((c) => c.id === film.cluster);
        if (!cluster) return null;
        return (
          <Link key={film.slug} href={`/movies/${film.slug}`} className="group flex flex-col items-center gap-2 text-center">
            <StarMark cluster={cluster} seed={film.slug} size={72} />
            <span className="text-[11.5px] leading-tight font-medium text-ink group-hover:text-accent-strong">
              {film.title}
            </span>
            <span className="text-[10px] text-ink-faint">{film.year}</span>
          </Link>
        );
      })}
    </div>
  );
}

function MoodsPreview() {
  return (
    <div className="grid grid-cols-2 gap-3 p-6">
      {CLUSTERS.map((cluster) => (
        <Link
          key={cluster.id}
          href={`/moods/${cluster.id}`}
          className="group flex items-center gap-3 rounded-2xl border border-line px-4 py-3.5 transition-colors hover:border-accent/40"
        >
          <StarMark cluster={cluster} seed={cluster.id} size={40} />
          <span>
            <span className="block text-[13px] font-semibold text-ink group-hover:text-accent-strong">
              {cluster.label}
            </span>
            <span className="block text-[11px] text-ink-faint">{cluster.mood}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function AvailableNow() {
  return (
    <div className="mb-16 border-t border-line pt-8">
      <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-success uppercase">Available now</p>
      <p className="mb-8 max-w-[58ch] text-[14px] leading-[1.75] text-ink-soft">
        No account needed for either — a small, hand-picked corner of the app you can browse cold.
      </p>
      <div className="flex flex-col gap-10">
        <Reveal>
          <PlateFrame
            title="Movies"
            caption={
              <>
                {CATALOG.length} real films — <em>{CATALOG[0].title}</em>,{" "}
                <em>{CATALOG[3].title}</em>, and {CATALOG.length - 2} others{" "}
                — each with what it&rsquo;s genuinely similar to and which of the four moods it sits in.
              </>
            }
          >
            <MoviesPreview />
          </PlateFrame>
        </Reveal>
        <Reveal delay={90}>
          <PlateFrame
            title="Moods"
            caption="The same four moods every film inside the app is actually placed by — not a separate marketing taxonomy."
          >
            <MoodsPreview />
          </PlateFrame>
        </Reveal>
      </div>
    </div>
  );
}
