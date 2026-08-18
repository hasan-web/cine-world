import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { verifySession } from "@/lib/dal";
import type { ClusterId, Film, Rewatch } from "@/lib/types";

interface FilmRow {
  id: string;
  title: string;
  director: string;
  year: number;
  country: string;
  rating: number;
  cluster: ClusterId | null;
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

export interface PublicFilmStats {
  logCount: number;
  rewatchCount: number;
  avgRating: number;
  topCluster: ClusterId | null;
}

interface PublicFilmStatsRow {
  log_count: number | string | null;
  rewatch_count: number | string | null;
  avg_rating: number | string | null;
  top_cluster: ClusterId | null;
}

/**
 * Real, anonymized usage numbers for a film's public /movies/[slug] page. Deliberately does not
 * call verifySession() (this is read by signed-out visitors, and public_film_stats() is granted to
 * the `anon` role for exactly that reason) and deliberately uses the cookie-free client rather than
 * the usual `createClient()` — touching cookies here would force the whole static/ISR movie page to
 * render dynamically on every request for data that has nothing to do with the visitor's session.
 *
 * Returns null both when the film has no logs yet and when it has too few to clear the
 * anonymization threshold enforced inside the SQL function itself — the two cases are
 * indistinguishable from here on purpose, so there's nothing for a caller to infer either way.
 */
export async function getPublicFilmStats(filmId: string): Promise<PublicFilmStats | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("public_film_stats", { p_film_id: filmId }).maybeSingle();

  if (error) throw new Error(`Failed to load film stats: ${error.message}`);
  const row = data as PublicFilmStatsRow | null;
  if (!row || row.log_count == null) return null;

  return {
    logCount: Number(row.log_count),
    rewatchCount: Number(row.rewatch_count),
    avgRating: Number(row.avg_rating),
    topCluster: row.top_cluster ?? null,
  };
}

export interface PublicSkyStar {
  id: string;
  title: string;
  cluster: ClusterId;
  rating: number;
}

/**
 * One account's sky for the public /sky/[token] page — opted into deliberately, looked up by a
 * random token rather than any account identifier. Same anonymized shape as the other public RPCs:
 * no note, no watched_on, no rewatch content, nothing that isn't needed to draw the sky itself and
 * label a star on hover. Empty array covers both "never generated a link" and "link was revoked" —
 * indistinguishable on purpose, same as the film-stats threshold.
 */
export async function getPublicSky(token: string): Promise<PublicSkyStar[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("public_sky_by_token", { p_token: token });

  if (error) throw new Error(`Failed to load this sky: ${error.message}`);
  return (data ?? []) as PublicSkyStar[];
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

/**
 * Storage ceilings. Every film row costs roughly 250-300 bytes once its index entry is counted,
 * so an unbounded import is the one action a single user could take that meaningfully eats the
 * database. These caps keep the worst case per account bounded and knowable.
 */
export const MAX_FILMS_PER_USER = 10_000;
export const MAX_IMPORT_ROWS = 5_000;

/** How many films this user already has — used to enforce MAX_FILMS_PER_USER before an import. */
export async function countFilms(): Promise<number> {
  const user = await verifySession();
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("films")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to count films: ${error.message}`);
  return count ?? 0;
}

/**
 * Films imported but not yet given a mood. These are deliberately kept out of the sky. Returned
 * a batch at a time — someone importing a decade of logging can have thousands of these, and
 * shipping them all to the browser to place a handful would be wasteful.
 */
export async function listUnplacedFilms(limit = 40): Promise<Film[]> {
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("films")
    .select(FILM_COLUMNS)
    .is("cluster", null)
    .order("watched_on", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load unplaced films: ${error.message}`);
  return (data as FilmRow[]).map(rowToFilm);
}

export async function countUnplacedFilms(): Promise<number> {
  const user = await verifySession();
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("films")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("cluster", null);

  if (error) throw new Error(`Failed to count unplaced films: ${error.message}`);
  return count ?? 0;
}

/** Gives an unplaced film its mood, which is what moves it into the sky. */
export async function placeFilm(filmId: string, cluster: ClusterId): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("films")
    .update({ cluster })
    .eq("id", filmId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to place film: ${error.message}`);
}

/**
 * Discards everything still waiting to be placed — the undo for an import the user regrets.
 * Manual logging always sets a mood, so an unplaced row can only have come from an import;
 * that's what makes this safe to offer as a bulk delete.
 */
export async function discardUnplacedFilms(): Promise<number> {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("films")
    .delete()
    .eq("user_id", user.id)
    .is("cluster", null)
    .select("id");

  if (error) throw new Error(`Failed to discard unplaced films: ${error.message}`);
  return data?.length ?? 0;
}

/**
 * Bulk-inserts imported films, skipping any the user already has rather than overwriting them —
 * an import must never clobber a mood or note someone set by hand. Chunked so a large library
 * doesn't become one enormous request, and so a partial failure is bounded.
 */
export async function insertImportedFilms(films: NewImportedFilm[]): Promise<number> {
  const user = await verifySession();
  const supabase = await createClient();

  const CHUNK = 500;
  let inserted = 0;

  for (let i = 0; i < films.length; i += CHUNK) {
    const rows = films.slice(i, i + CHUNK).map((f) => ({
      id: f.id,
      user_id: user.id,
      title: f.title,
      director: f.director,
      year: f.year,
      country: f.country,
      rating: f.rating,
      cluster: null,
      note: f.note ?? null,
      rewatches: f.rewatches,
      watched_on: f.watchedOn,
    }));

    const { data, error } = await supabase
      .from("films")
      .upsert(rows, { onConflict: "user_id,id", ignoreDuplicates: true })
      .select("id");

    if (error) throw new Error(`Failed to import films: ${error.message}`);
    inserted += data?.length ?? 0;
  }

  return inserted;
}

export interface NewImportedFilm {
  id: string;
  title: string;
  director: string;
  year: number;
  country: string;
  rating: number;
  note?: string;
  rewatches: Rewatch[];
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
