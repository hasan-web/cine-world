import { RewatchRecord } from "@/components/film/RewatchRecord";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import type { Film } from "@/lib/types";

interface FilmEntryProps {
  film: Film;
  specimenNumber?: number;
  justLogged?: boolean;
}

export function FilmEntry({ film, specimenNumber, justLogged }: FilmEntryProps) {
  const cluster = CLUSTERS.find((c) => c.id === film.cluster);

  return (
    <div className="flex flex-wrap gap-8">
      <div className="w-[220px] flex-none border-r border-line pr-8">
        <SkyCanvas
          films={[film]}
          clusters={[{ ...cluster!, x: 0.5, y: 0.5 }]}
          height={180}
          newStarId={justLogged ? film.id : undefined}
        />
      </div>
      <div className="min-w-[240px] flex-1">
        {specimenNumber != null && (
          <p className="mb-1 text-[10.5px] font-semibold tracking-[0.1em] text-accent uppercase">
            Specimen no. {specimenNumber}
          </p>
        )}
        <p className="mb-0.5 text-[22px] font-semibold text-ink">{film.title}</p>
        <p className="mb-1 text-[11px] tracking-[0.04em] text-ink-faint uppercase">
          {film.director} · {film.year} · {film.country}
        </p>
        {film.watchedOn && (
          <p className="mb-4 text-[11px] text-ink-faint">
            Watched{" "}
            {new Date(`${film.watchedOn}T00:00:00`).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        <div className="mb-4 flex items-center gap-2.5">
          <span className="text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Assessment</span>
          <div className="flex gap-1.5" aria-label={`${film.rating} of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i < film.rating ? "bg-accent" : "bg-line"}`} />
            ))}
          </div>
        </div>

        {film.note && <p className="mb-5 max-w-[38ch] text-[13.5px] leading-[1.7] text-ink-soft">{film.note}</p>}

        <RewatchRecord filmId={film.id} initialRewatches={film.rewatches ?? []} initialCluster={film.cluster} />
      </div>
    </div>
  );
}
