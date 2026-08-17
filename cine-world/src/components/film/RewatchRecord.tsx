"use client";

import { useActionState, useState } from "react";
import { logRewatch, type LogRewatchState } from "@/app/film/[id]/actions";
import { CLUSTERS } from "@/data/clusters";
import type { ClusterId, Rewatch } from "@/lib/types";

interface RewatchRecordProps {
  filmId: string;
  initialRewatches: Rewatch[];
  /** Null for a film that's still unplaced — the picker just starts on the first mood instead. */
  initialCluster: ClusterId | null;
}

const initialActionState: LogRewatchState = {};

function sortKey(r: Rewatch): string {
  return r.date ?? `${r.year}-01-01`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RewatchRecord({ filmId, initialRewatches, initialCluster }: RewatchRecordProps) {
  const [state, action, pending] = useActionState(logRewatch.bind(null, filmId), initialActionState);
  const [prevState, setPrevState] = useState(state);
  const [rewatches, setRewatches] = useState(initialRewatches);
  const [justAdded, setJustAdded] = useState<Rewatch | null>(null);
  const [rating, setRating] = useState(4);
  const [cluster, setCluster] = useState<ClusterId>(initialCluster ?? CLUSTERS[0].id);

  if (state !== prevState) {
    setPrevState(state);
    if (state.addedRewatch) {
      const added = state.addedRewatch;
      setRewatches((prev) => [...prev, added].sort((a, b) => sortKey(a).localeCompare(sortKey(b))));
      setJustAdded(added);
    }
  }

  return (
    <div className="border-t border-line pt-3">
      <span className="mb-2 block text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Rewatch record</span>
      {rewatches.length > 0 && (
        <div className="relative mb-1 flex h-[34px] items-start">
          <div className="absolute top-[14px] right-0 left-0 h-px bg-line" />
          {rewatches.map((rewatch, i) => {
            const label = CLUSTERS.find((c) => c.id === rewatch.cluster)?.label;
            const tooltip = [
              rewatch.date ?? String(rewatch.year),
              label,
              `${rewatch.rating}/5`,
              rewatch.note,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={`${rewatch.date ?? rewatch.year}-${i}`}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${(i / (rewatches.length - 1 || 1)) * 100}%`, top: "10px" }}
                title={tooltip}
              >
                <span
                  className={`h-[6px] w-[6px] rotate-45 bg-accent ${rewatch === justAdded ? "animate-rewatch-settle" : ""}`}
                  style={{ opacity: 0.45 + 0.55 * (i / (rewatches.length - 1 || 1)) }}
                />
                <span className="mt-1.5 text-[9px] text-ink-faint">
                  {rewatch.date ? rewatch.date.slice(0, 4) : rewatch.year}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <form action={action} className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-3">
        <input type="hidden" name="rating" value={rating} />
        <input type="hidden" name="cluster" value={cluster} />
        <label className="flex items-baseline gap-2">
          <span className="text-[9.5px] tracking-[0.06em] text-ink-faint uppercase">Watched</span>
          <input
            name="date"
            type="date"
            defaultValue={todayIso()}
            max={todayIso()}
            className="border-b border-line bg-transparent pb-1 text-[11.5px] text-ink outline-none"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] tracking-[0.06em] text-ink-faint uppercase">Felt</span>
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                aria-label={`${n} of 5`}
                onClick={() => setRating(n)}
                className={`h-2 w-2 rounded-full ${n <= rating ? "bg-accent" : "bg-line"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] tracking-[0.06em] text-ink-faint uppercase">Mood</span>
          <div className="flex gap-3">
            {CLUSTERS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCluster(c.id)}
                className={`text-[10.5px] tracking-[0.02em] uppercase ${
                  cluster === c.id ? "border-b border-accent font-semibold text-accent-strong" : "text-ink-soft"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex basis-full items-baseline gap-2">
          <span className="text-[9.5px] tracking-[0.06em] text-ink-faint uppercase">Note</span>
          <input
            name="note"
            placeholder="what was different this time…"
            className="flex-1 border-b border-line bg-transparent pb-1 text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="text-[10.5px] font-semibold tracking-[0.04em] text-accent-strong uppercase underline decoration-accent-strong/50 underline-offset-4 disabled:opacity-50"
        >
          {pending ? "pressing…" : "log a rewatch →"}
        </button>
        {state.error && <p className="basis-full text-[11.5px] text-accent-strong">{state.error}</p>}
      </form>
    </div>
  );
}
