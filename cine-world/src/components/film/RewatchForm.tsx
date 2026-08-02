"use client";

import { useActionState, useState } from "react";
import { logRewatch, type LogRewatchState } from "@/app/film/[id]/actions";

const initialState: LogRewatchState = {};

export function RewatchForm({ filmId }: { filmId: string }) {
  const [state, action, pending] = useActionState(logRewatch.bind(null, filmId), initialState);
  const [rating, setRating] = useState(4);

  return (
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
  );
}
