import "server-only";

const TMDB_BASE = "https://api.themoviedb.org/3";

export interface TmdbSearchResult {
  id: number;
  title: string;
  year: number | null;
}

export interface TmdbMovieDetails {
  title: string;
  director: string;
  year: number;
  country: string;
}

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

function yearFromReleaseDate(releaseDate: string | undefined): number | null {
  if (!releaseDate) return null;
  const year = Number(releaseDate.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : null;
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
  const data = await res.json();

  return (data.results as Array<{ id: number; title: string; release_date?: string }>)
    .slice(0, 8)
    .map((r) => ({ id: r.id, title: r.title, year: yearFromReleaseDate(r.release_date) }));
}

export async function getMovieDetails(id: number): Promise<TmdbMovieDetails> {
  const url = new URL(`${TMDB_BASE}/movie/${id}`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("append_to_response", "credits");

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`TMDB movie details failed: ${res.status}`);
  const data = await res.json();

  const director = (data.credits?.crew as Array<{ job: string; name: string }> | undefined)?.find(
    (c) => c.job === "Director",
  );

  return {
    title: data.title,
    director: director?.name ?? "",
    year: yearFromReleaseDate(data.release_date) ?? new Date().getFullYear(),
    country: data.production_countries?.[0]?.name ?? "",
  };
}
