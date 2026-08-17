"use client";

import { useActionState, useRef, useState } from "react";
import { TitleSearch } from "@/components/log/TitleSearch";
import { AppShell } from "@/components/shell/AppShell";
import { CLUSTERS } from "@/data/clusters";
import type { TmdbMovieDetails } from "@/lib/tmdb";
import type { ClusterId } from "@/lib/types";
import { logFilm, type LogFilmState } from "./actions";

const initialState: LogFilmState = {};

export default function LogPage() {
  const [state, action, pending] = useActionState(logFilm, initialState);
  const [cluster, setCluster] = useState<ClusterId>(CLUSTERS[0].id);
  const [rating, setRating] = useState(4);
  const directorRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);

  function handleSelect(details: TmdbMovieDetails) {
    if (directorRef.current) directorRef.current.value = details.director;
    if (yearRef.current) yearRef.current.value = String(details.year);
    if (countryRef.current) countryRef.current.value = details.country;
  }

  return (
    <AppShell userEmail="" activePath="/log">
      <div className="mx-auto w-full max-w-[560px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Log a film</h1>
        <p className="mb-6 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
          Search finds the title and fills in the rest — you still decide where it sits. A mood is something you
          assign, not a genre the catalogue assigns for you.
        </p>

        <form action={action} className="glass p-6">
          <input type="hidden" name="cluster" value={cluster} />
          <input type="hidden" name="rating" value={rating} />

          <TitleSearch onSelect={handleSelect} />

          <div className="mb-5 flex gap-4">
            <label className="flex flex-1 items-baseline gap-2.5">
              <span className="text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Director</span>
              <input
                ref={directorRef}
                name="director"
                className="flex-1 border-b border-line bg-transparent pb-1.5 text-[13px] text-ink outline-none"
              />
            </label>
            <label className="flex w-20 items-baseline gap-2">
              <span className="text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Year</span>
              <input
                ref={yearRef}
                name="year"
                inputMode="numeric"
                className="w-14 border-b border-line bg-transparent pb-1.5 text-[13px] text-ink outline-none"
              />
            </label>
          </div>

          <div className="mb-6 flex gap-4">
            <label className="flex flex-1 items-baseline gap-2.5">
              <span className="text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Country</span>
              <input
                ref={countryRef}
                name="country"
                className="flex-1 border-b border-line bg-transparent pb-1.5 text-[13px] text-ink outline-none"
              />
            </label>
            <label className="flex items-baseline gap-2.5">
              <span className="text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Watched</span>
              <input
                name="watchedOn"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                max={new Date().toISOString().slice(0, 10)}
                className="border-b border-line bg-transparent pb-1.5 text-[13px] text-ink outline-none"
              />
            </label>
          </div>

          <p className="mb-2 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Mood</p>
          <div className="mb-6 flex gap-6">
            {CLUSTERS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCluster(c.id)}
                className={`text-left ${cluster === c.id ? "text-accent-strong" : "text-ink-soft"}`}
              >
                <span
                  className={`block text-[11.5px] font-semibold uppercase ${
                    cluster === c.id ? "border-b border-accent" : ""
                  }`}
                >
                  {c.label}
                </span>
                <span className="mt-1 block text-[11px] italic">{c.mood}</span>
              </button>
            ))}
          </div>

          <p className="mb-2 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Assessment</p>
          <div className="mb-6 flex gap-2">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                aria-label={`${n} of 5`}
                onClick={() => setRating(n)}
                className={`h-3 w-3 rounded-full ${n <= rating ? "bg-accent" : "bg-line"}`}
              />
            ))}
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Note</span>
            <textarea
              name="note"
              placeholder="what stayed with you…"
              rows={3}
              className="w-full resize-none border-b border-line bg-transparent pb-1.5 text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
            />
          </label>

          {state.error && <p className="mb-4 text-[12.5px] text-accent-strong">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "placing…" : "place the star →"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
