import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import type { ClusterId, Film, Rewatch } from "@/lib/types";

interface FilmRow {
  id: string;
  title: string;
  director: string;
  year: number;
  country: string;
  rating: number;
  cluster: ClusterId;
  note: string | null;
  rewatches: Rewatch[];
  watched_on: string;
}

const FILM_COLUMNS = "id, title, director, year, country, rating, cluster, note, rewatches, watched_on";

function rowToFilm(row: FilmRow): Film {
  return {
    id: row.id,
    title: row.title,
    director: row.director,
    year: row.year,
    country: row.country,
    rating: row.rating,
    cluster: row.cluster,
    note: row.note ?? undefined,
    rewatches: row.rewatches.length > 0 ? row.rewatches : undefined,
    watchedOn: row.watched_on,
  };
}

/** The signed-in user's full collection. RLS also scopes this, but we verify the session up front too. */
export async function listFilms(): Promise<Film[]> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase.from("films").select(FILM_COLUMNS).order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load films: ${error.message}`);
  return (data as FilmRow[]).map(rowToFilm);
}

export async function getFilm(id: string): Promise<Film | null> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase.from("films").select(FILM_COLUMNS).eq("id", id).maybeSingle();

  if (error) throw new Error(`Failed to load film: ${error.message}`);
  return data ? rowToFilm(data as FilmRow) : null;
}

/** A friend's collection — RLS only allows this when the friendship is accepted, so an empty array means either. */
export async function listFilmsForUser(userId: string): Promise<Film[]> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("films")
    .select(FILM_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load films: ${error.message}`);
  return (data as FilmRow[]).map(rowToFilm);
}

export interface CommonsPlacement {
  cluster: ClusterId;
  rating: number;
}

/** Everyone's placement of this film, anonymized — no user identity attached. See film_commons() in schema.sql. */
export async function getFilmCommons(id: string): Promise<CommonsPlacement[]> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("film_commons", { film_id: id });

  if (error) throw new Error(`Failed to load the commons: ${error.message}`);
  return data as CommonsPlacement[];
}

export interface NewFilm {
  id: string;
  title: string;
  director: string;
  year: number;
  country: string;
  rating: number;
  cluster: ClusterId;
  note?: string;
  watchedOn: string;
}

/** Sorts chronologically by real date when present, falling back to just the year for legacy entries. */
function rewatchSortKey(r: Rewatch): string {
  return r.date ?? `${r.year}-01-01`;
}

/** Appends a rewatch to an existing film, keeping the record chronological rather than log order. */
export async function addRewatch(filmId: string, rewatch: Rewatch): Promise<void> {
  const user = await verifySession();
  const film = await getFilm(filmId);
  if (!film) throw new Error("Film not found");

  const rewatches = [...(film.rewatches ?? []), rewatch].sort((a, b) =>
    rewatchSortKey(a).localeCompare(rewatchSortKey(b)),
  );

  const supabase = await createClient();
  const { error } = await supabase.from("films").update({ rewatches }).eq("id", filmId).eq("user_id", user.id);

  if (error) throw new Error(`Failed to log rewatch: ${error.message}`);
}

/**
 * Inserts a new specimen — deliberately `.insert()`, not `.upsert()`, so logging a film you
 * already have can never silently overwrite your original rating/mood/note. A unique-violation
 * (23505) means it already exists; the caller should add a rewatch instead.
 */
export async function createFilm(input: NewFilm): Promise<{ alreadyExists: boolean }> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase.from("films").insert({
    id: input.id,
    user_id: user.id,
    title: input.title,
    director: input.director,
    year: input.year,
    country: input.country,
    rating: input.rating,
    cluster: input.cluster,
    note: input.note ?? null,
    watched_on: input.watchedOn,
  });

  if (error) {
    if (error.code === "23505") return { alreadyExists: true };
    throw new Error(`Failed to save film: ${error.message}`);
  }
  return { alreadyExists: false };
}
