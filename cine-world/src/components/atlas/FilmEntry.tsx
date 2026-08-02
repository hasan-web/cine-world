import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import type { Film } from "@/lib/types";

interface FilmEntryProps {
  film: Film;
  specimenNumber?: number;
}

export function FilmEntry({ film, specimenNumber }: FilmEntryProps) {
  const cluster = CLUSTERS.find((c) => c.id === film.cluster);

  return (
    <div className="flex flex-wrap gap-8">
      <div className="w-[220px] flex-none border-r border-line-soft pr-8">
        <SkyCanvas films={[film]} clusters={[{ ...cluster!, x: 0.5, y: 0.5 }]} height={180} color="#8d703a" />
      </div>
      <div className="min-w-[240px] flex-1">
        {specimenNumber != null && (
          <p className="mb-1 font-display text-[9.5px] tracking-[0.14em] text-brass uppercase">
            Specimen no. {specimenNumber}
          </p>
        )}
        <p className="mb-0.5 font-body text-[22px] italic">{film.title}</p>
        <p className="mb-4 font-mono text-[10px] tracking-[0.08em] text-ink-soft uppercase">
          {film.director} · {film.year} · {film.country}
        </p>

        <div className="mb-4 flex items-center gap-2.5">
          <span className="font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Assessment</span>
          <div className="flex gap-1.5" aria-label={`${film.rating} of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`h-[7px] w-[7px] rotate-45 ${i < film.rating ? "bg-brass-light" : "bg-line"}`}
              />
            ))}
          </div>
        </div>

        {film.note && <p className="mb-5 max-w-[38ch] text-[13.5px] leading-[1.7] text-ink-soft">{film.note}</p>}

        {film.rewatches && film.rewatches.length > 0 && (
          <div className="border-t border-line-soft pt-3">
            <span className="mb-2 block font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">
              Rewatch record
            </span>
            <div className="relative flex h-[34px] items-start">
              <div className="absolute top-[14px] right-0 left-0 h-px bg-line" />
              {film.rewatches.map((rewatch, i) => (
                <div
                  key={rewatch.year}
                  className="absolute flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `${(i / (film.rewatches!.length - 1 || 1)) * 100}%`, top: "10px" }}
                >
                  <span
                    className="h-[6px] w-[6px] rotate-45 bg-brass-light"
                    style={{ opacity: 0.45 + 0.55 * (i / (film.rewatches!.length - 1 || 1)) }}
                  />
                  <span className="mt-1.5 font-mono text-[9px] text-ink-soft">{rewatch.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
