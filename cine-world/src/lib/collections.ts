import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { FILM_COLUMNS, rowToFilm, type FilmRow } from "@/lib/films";
import type { Collection, Film } from "@/lib/types";

/** Every collection this user has, with how many films are in each. */
export async function listCollections(): Promise<Collection[]> {
  const user = await verifySession();
  const supabase = await createClient();

  const [{ data: collections, error: collectionsError }, { data: memberships, error: membershipsError }] =
    await Promise.all([
      supabase.from("collections").select("id, name, created_at").eq("user_id", user.id).order("created_at"),
      supabase.from("collection_films").select("collection_id").eq("user_id", user.id),
    ]);

  if (collectionsError) throw new Error(`Failed to load collections: ${collectionsError.message}`);
  if (membershipsError) throw new Error(`Failed to load collections: ${membershipsError.message}`);

  const counts = new Map<string, number>();
  for (const row of memberships ?? []) {
    counts.set(row.collection_id, (counts.get(row.collection_id) ?? 0) + 1);
  }

  return (collections ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    createdAt: c.created_at,
    filmCount: counts.get(c.id) ?? 0,
  }));
}

export async function getCollection(id: string): Promise<Collection | null> {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load collection: ${error.message}`);
  if (!data) return null;

  const { count } = await supabase
    .from("collection_films")
    .select("film_id", { count: "exact", head: true })
    .eq("collection_id", id)
    .eq("user_id", user.id);

  return { id: data.id, name: data.name, createdAt: data.created_at, filmCount: count ?? 0 };
}

/** The films inside a collection, in the order they were added. */
export async function listCollectionFilms(id: string): Promise<Film[]> {
  const user = await verifySession();
  const supabase = await createClient();

  const { data: memberships, error: membershipsError } = await supabase
    .from("collection_films")
    .select("film_id")
    .eq("collection_id", id)
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (membershipsError) throw new Error(`Failed to load collection: ${membershipsError.message}`);
  const filmIds = (memberships ?? []).map((m) => m.film_id);
  if (filmIds.length === 0) return [];

  const { data: films, error: filmsError } = await supabase
    .from("films")
    .select(FILM_COLUMNS)
    .eq("user_id", user.id)
    .in("id", filmIds);

  if (filmsError) throw new Error(`Failed to load collection: ${filmsError.message}`);

  const byId = new Map((films as FilmRow[]).map((f) => [f.id, rowToFilm(f)]));
  return filmIds.map((id) => byId.get(id)).filter((f): f is Film => f !== undefined);
}

/** Which of this user's collections already contain the given film — for an "add to collection" menu. */
export async function listCollectionIdsForFilm(filmId: string): Promise<string[]> {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_films")
    .select("collection_id")
    .eq("user_id", user.id)
    .eq("film_id", filmId);

  if (error) throw new Error(`Failed to load collections: ${error.message}`);
  return (data ?? []).map((r) => r.collection_id);
}

export async function createCollection(name: string): Promise<Collection> {
  const user = await verifySession();
  const supabase = await createClient();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("collections").insert({ id, user_id: user.id, name });
  if (error) throw new Error(`Failed to create collection: ${error.message}`);

  return { id, name, createdAt: new Date().toISOString(), filmCount: 0 };
}

export async function renameCollection(id: string, name: string): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase.from("collections").update({ name }).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(`Failed to rename collection: ${error.message}`);
}

/** Cascades to collection_films — see schema.sql. */
export async function deleteCollection(id: string): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase.from("collections").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(`Failed to delete collection: ${error.message}`);
}

export async function addFilmToCollection(collectionId: string, filmId: string): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("collection_films")
    .upsert({ collection_id: collectionId, user_id: user.id, film_id: filmId }, { onConflict: "collection_id,film_id" });

  if (error) throw new Error(`Failed to add film to collection: ${error.message}`);
}

export async function removeFilmFromCollection(collectionId: string, filmId: string): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("collection_films")
    .delete()
    .eq("collection_id", collectionId)
    .eq("user_id", user.id)
    .eq("film_id", filmId);

  if (error) throw new Error(`Failed to remove film from collection: ${error.message}`);
}
