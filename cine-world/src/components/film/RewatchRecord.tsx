"use client";

import { useActionState, useState } from "react";
import { logRewatch, type LogRewatchState } from "@/app/film/[id]/actions";
import type { Rewatch } from "@/lib/types";

interface RewatchRecordProps {
  filmId: string;
  initialRewatches: Rewatch[];
}

const initialActionState: LogRewatchState = {};

export function RewatchRecord({ filmId, initialRewatches }: RewatchRecordProps) {
  const [state, action, pending] = useActionState(logRewatch.bind(null, filmId), initialActionState);
  const [prevState, setPrevState] = useState(state);
  const [rewatches, setRewatches] = useState(initialRewatches);
  const [justAdded, setJustAdded] = useState<Rewatch | null>(null);
  const [rating, setRating] = useState(4);

  if (state !== prevState) {
    setPrevState(state);
    if (state.addedRewatch) {
      const added = state.addedRewatch;
      setRewatches((prev) => [...prev, added].sort((a, b) => a.year - b.year));
      setJustAdded(added);
    }
  }

  return (
    <div className="border-t border-line-soft pt-3">
      <span className="mb-2 block font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">
        Rewatch record
      </span>
      {rewatches.length > 0 && (
        <div className="relative mb-1 flex h-[34px] items-start">
          <div className="absolute top-[14px] right-0 left-0 h-px bg-line" />
          {rewatches.map((rewatch, i) => (
            <div
              key={`${rewatch.year}-${i}`}
              className="absolute flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${(i / (rewatches.length - 1 || 1)) * 100}%`, top: "10px" }}
            >
              <span
                className={`h-[6px] w-[6px] rotate-45 bg-brass-light ${rewatch === justAdded ? "animate-rewatch-settle" : ""}`}
                style={{ opacity: 0.45 + 0.55 * (i / (rewatches.length - 1 || 1)) }}
              />
              <span className="mt-1.5 font-mono text-[9px] text-ink-soft">{rewatch.year}</span>
            </div>
          ))}
        </div>
      )}

      <form action={action} className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <input type="hidden" name="rating" value={rating} />
        <label className="flex items-baseline gap-2">
          <span className="font-mono text-[9px] tracking-[0.1em] text-ink-soft uppercase">Year</span>
          <input
            name="year"
            inputMode="numeric"
            placeholder={String(new Date().getFullYear())}
            className="w-14 border-b border-line bg-transparent pb-1 font-mono text-[11.5px] text-ink outline-none placeholder:text-ink-soft/60"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.1em] text-ink-soft uppercase">Felt</span>
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                aria-label={`${n} of 5`}
                onClick={() => setRating(n)}
                className={`h-[8px] w-[8px] rotate-45 ${n <= rating ? "bg-brass-light" : "bg-line"}`}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="font-mono text-[10px] tracking-[0.08em] text-oxblood uppercase underline decoration-oxblood/50 underline-offset-4 disabled:opacity-50"
        >
          {pending ? "pressing…" : "log a rewatch →"}
        </button>
        {state.error && <p className="basis-full text-[11.5px] text-oxblood">{state.error}</p>}
      </form>
    </div>
  );
}
