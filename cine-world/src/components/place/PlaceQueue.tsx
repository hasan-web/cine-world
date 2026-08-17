"use client";

import { useState } from "react";
import { place } from "@/app/place/actions";
import { CLUSTERS } from "@/data/clusters";
import type { ClusterId, Film } from "@/lib/types";

interface PlaceQueueProps {
  films: Film[];
  /** Total still unplaced, which can exceed the batch handed to this component. */
  remaining: number;
}

export function PlaceQueue({ films, remaining }: PlaceQueueProps) {
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const film = films[index];

  // The batch is exhausted — a reload pulls the next one, so ask for it rather than pretending
  // we're finished when there may be hundreds more waiting.
  if (!film) {
    const more = remaining - films.length > 0;
    return (
      <div className="glass p-8 text-center">
        <p className="mb-2 text-[15px] font-semibold text-ink">
          {more ? "That's this batch placed." : "Everything's placed."}
        </p>
        <p className="mb-6 text-[13.5px] text-ink-soft">
          {more
            ? `${(remaining - films.length).toLocaleString()} still waiting.`
            : "Your sky is up to date."}
        </p>
        <a
          href={more ? "/place" : "/collection"}
          className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white"
        >
          {more ? "Load the next batch →" : "See your sky →"}
        </a>
      </div>
    );
  }

  async function choose(cluster: ClusterId) {
    if (pending || !film) return;
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("filmId", film.id);
    formData.set("cluster", cluster);

    const result = await place({}, formData);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-[11px] tracking-[0.06em] text-ink-faint uppercase">
          {index + 1} of {films.length} in this batch
        </p>
        <p className="text-[11px] text-ink-faint">{remaining.toLocaleString()} waiting overall</p>
      </div>

      <div className="glass mb-5 px-7 py-10 text-center">
        <p className="mb-1 text-[24px] leading-tight font-semibold text-ink">{film.title}</p>
        <p className="text-[13px] text-ink-soft">
          {film.year || "year unknown"}
          {film.rating ? ` · you rated it ${film.rating}/5` : ""}
        </p>
        {film.note && (
          <p className="mx-auto mt-4 max-w-[46ch] text-[13px] leading-[1.7] text-ink-soft italic">
            &ldquo;{film.note}&rdquo;
          </p>
        )}
      </div>

      <p className="mb-3 text-center text-[13.5px] text-ink-soft">How did it feel?</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {CLUSTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={pending}
            onClick={() => choose(c.id)}
            className="glass px-5 py-4 text-left transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span className="block text-[13.5px] font-semibold text-accent-strong">{c.label}</span>
            <span className="block text-[12.5px] text-ink-soft">{c.mood}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 text-center">
        <button
          type="button"
          disabled={pending}
          onClick={() => setIndex((i) => i + 1)}
          className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-4 disabled:opacity-50"
        >
          skip this one for now
        </button>
      </div>

      {error && <p className="mt-4 text-center text-[12.5px] text-accent-strong">{error}</p>}
    </div>
  );
}
