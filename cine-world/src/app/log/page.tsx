"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { TitleSearch } from "@/components/log/TitleSearch";
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
    <main className="mx-auto max-w-[560px] px-7 py-16">
      <Link href="/collection" className="font-mono text-[10.5px] tracking-[0.1em] text-brass uppercase">
        ← the collection
      </Link>

      <h1 className="mt-6 mb-1 font-display text-[13px] tracking-[0.14em] text-oxblood uppercase">
        Plate IV <span className="ml-2 font-body text-[15px] tracking-normal italic text-ink-soft normal-case">— logging a watch</span>
      </h1>
      <p className="mb-8 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
        Search finds the title and fills in the rest — you still decide where it sits. A cluster is a mood you
        assign, not a genre the catalogue assigns for you.
      </p>

      <form action={action} className="border border-line bg-paper-deep p-6">
        <input type="hidden" name="cluster" value={cluster} />
        <input type="hidden" name="rating" value={rating} />

        <TitleSearch onSelect={handleSelect} />

        <div className="mb-5 flex gap-4">
          <label className="flex flex-1 items-baseline gap-2.5">
            <span className="font-mono text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Director</span>
            <input
              ref={directorRef}
              name="director"
              className="flex-1 border-b border-line bg-transparent pb-1.5 font-mono text-[12px] text-ink outline-none"
            />
          </label>
          <label className="flex w-20 items-baseline gap-2">
            <span className="font-mono text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Year</span>
            <input
              ref={yearRef}
              name="year"
              inputMode="numeric"
              className="w-14 border-b border-line bg-transparent pb-1.5 font-mono text-[12px] text-ink outline-none"
            />
          </label>
        </div>

        <label className="mb-6 flex items-baseline gap-2.5">
          <span className="w-16 flex-none font-mono text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Country</span>
          <input
            ref={countryRef}
            name="country"
            className="flex-1 border-b border-line bg-transparent pb-1.5 font-mono text-[12px] text-ink outline-none"
          />
        </label>

        <p className="mb-2 font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Place in</p>
        <div className="mb-6 flex gap-6">
          {CLUSTERS.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCluster(c.id)}
              className={`text-left ${cluster === c.id ? "text-brass" : "text-ink-soft"}`}
            >
              <span
                className={`block font-mono text-[10.5px] tracking-[0.08em] uppercase ${
                  cluster === c.id ? "border-b border-brass" : ""
                }`}
              >
                {c.label}
              </span>
              <span className="mt-1 block font-body text-[11px] italic">{c.mood}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Assessment</p>
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              aria-label={`${n} of 5`}
              onClick={() => setRating(n)}
              className={`h-[11px] w-[11px] rotate-45 ${n <= rating ? "bg-brass-light" : "bg-line"}`}
            />
          ))}
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block font-mono text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Note</span>
          <textarea
            name="note"
            placeholder="what stayed with you…"
            rows={3}
            className="w-full resize-none border-b border-line bg-transparent pb-1.5 font-body text-[13.5px] text-ink outline-none placeholder:text-ink-soft/60"
          />
        </label>

        {state.error && <p className="mb-4 text-[12.5px] text-oxblood">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="font-mono text-[10.5px] tracking-[0.08em] text-oxblood uppercase underline decoration-oxblood/50 underline-offset-4 disabled:opacity-50"
        >
          {pending ? "placing…" : "place the star →"}
        </button>
      </form>
    </main>
  );
}
