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
}

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
  };
}

/** The signed-in user's full collection. RLS also scopes this, but we verify the session up front too. */
export async function listFilms(): Promise<Film[]> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("films")
    .select("id, title, director, year, country, rating, cluster, note, rewatches")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load films: ${error.message}`);
  return (data as FilmRow[]).map(rowToFilm);
}

export async function getFilm(id: string): Promise<Film | null> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("films")
    .select("id, title, director, year, country, rating, cluster, note, rewatches")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load film: ${error.message}`);
  return data ? rowToFilm(data as FilmRow) : null;
}

/** A friend's collection — RLS only allows this when the friendship is accepted, so an empty array means either. */
export async function listFilmsForUser(userId: string): Promise<Film[]> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("films")
    .select("id, title, director, year, country, rating, cluster, note, rewatches")
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
}

/** Appends a rewatch to an existing film, keeping the record chronological rather than log order. */
export async function addRewatch(filmId: string, rewatch: Rewatch): Promise<void> {
  const user = await verifySession();
  const film = await getFilm(filmId);
  if (!film) throw new Error("Film not found");

  const rewatches = [...(film.rewatches ?? []), rewatch].sort((a, b) => a.year - b.year);

  const supabase = await createClient();
  const { error } = await supabase.from("films").update({ rewatches }).eq("id", filmId).eq("user_id", user.id);

  if (error) throw new Error(`Failed to log rewatch: ${error.message}`);
}

export async function createFilm(input: NewFilm): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase.from("films").upsert({
    id: input.id,
    user_id: user.id,
    title: input.title,
    director: input.director,
    year: input.year,
    country: input.country,
    rating: input.rating,
    cluster: input.cluster,
    note: input.note ?? null,
  });

  if (error) throw new Error(`Failed to save film: ${error.message}`);
}
