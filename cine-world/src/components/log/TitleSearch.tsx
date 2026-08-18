"use client";

import { useEffect, useRef, useState } from "react";
import type { TmdbMovieDetails, TmdbSearchResult } from "@/lib/tmdb";

interface TitleSearchProps {
  onSelect: (details: TmdbMovieDetails) => void;
  defaultValue?: string;
}

/** A title field that doubles as a TMDB search-as-you-type — selecting a result fills in the rest of the form. */
export function TitleSearch({ onSelect, defaultValue = "" }: TitleSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results ?? []);
          setOpen(true);
        })
        .catch(() => {
          // search is a convenience, not required — typing manually still works
        });
    }, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derived, not stored: avoids a synchronous setState-in-effect just to clear stale
  // results when the query gets short again after being long enough to search.
  const visibleResults = query.trim().length < 2 ? [] : results;

  async function selectResult(result: TmdbSearchResult) {
    setQuery(result.title);
    setOpen(false);
    setResults([]);
    try {
      const res = await fetch(`/api/tmdb/movie/${result.id}`);
      const details: TmdbMovieDetails = await res.json();
      onSelect(details);
    } catch {
      onSelect({ title: result.title, director: "", year: result.year ?? new Date().getFullYear(), country: "" });
    }
  }

  return (
    <div className="mb-4 flex items-baseline gap-2.5">
      <span className="w-16 flex-none text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Title</span>
      <div ref={containerRef} className="relative flex-1">
        <input
          name="title"
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => visibleResults.length > 0 && setOpen(true)}
          autoComplete="off"
          placeholder="what did you watch…"
          className="w-full border-b border-line bg-transparent pb-1.5 text-[13px] text-ink outline-none placeholder:text-ink-faint"
        />
        {open && visibleResults.length > 0 && (
          <ul className="glass absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto !rounded-xl">
            {visibleResults.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => selectResult(r)}
                  className="flex w-full items-baseline justify-between px-4 py-2 text-left hover:bg-glass-edge"
                >
                  <span className="text-[13px] text-ink">{r.title}</span>
                  <span className="text-[10.5px] text-ink-faint">{r.year ?? "—"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
