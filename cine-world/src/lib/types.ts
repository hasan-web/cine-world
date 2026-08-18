export type ClusterId = "solitudo" | "amplitudo" | "domus" | "lacrima";

export interface Cluster {
  id: ClusterId;
  /** Latin name shown on the chart, e.g. "Solitudo" */
  label: string;
  /** What kind of watch this cluster gathers, for captions/UI copy. */
  mood: string;
  /** Fractional anchor position (0-1) within a plate. */
  x: number;
  y: number;
  /** One-sentence public description, used on /moods/[slug]. */
  description: string;
}

export interface Rewatch {
  year: number;
  rating: number;
  /** ISO date (YYYY-MM-DD) — added later, so older entries may only have `year`. Prefer this for display when present. */
  date?: string;
  cluster?: ClusterId;
  note?: string;
}

export interface Film {
  id: string;
  title: string;
  director: string;
  year: number;
  country: string;
  /** 1-5, drives star size/brightness. */
  rating: number;
  /**
   * Which mood the film was placed in, or null when it's still waiting to be placed — imported
   * films land unplaced, since a Letterboxd export can't say how something felt.
   */
  cluster: ClusterId | null;
  note?: string;
  rewatches?: Rewatch[];
  /** ISO date (YYYY-MM-DD) this specimen was actually watched — distinct from the film's release `year`. */
  watchedOn?: string;
}

/** A film its owner has actually placed — the only kind that can be drawn into a sky. */
export type PlacedFilm = Film & { cluster: ClusterId };

export function isPlaced(film: Film): film is PlacedFilm {
  return film.cluster !== null;
}
