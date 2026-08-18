"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addFilmToCollection,
  createCollection,
  deleteCollection,
  removeFilmFromCollection,
  renameCollection,
} from "@/lib/collections";

export interface NewCollectionState {
  error?: string;
}

export async function createCollectionAction(
  _prevState: NewCollectionState,
  formData: FormData,
): Promise<NewCollectionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give it a name first." };

  const collection = await createCollection(name);
  revalidatePath("/collections");
  redirect(`/collections/${collection.id}`);
}

export async function renameCollectionAction(id: string, name: string): Promise<void> {
  if (!name.trim()) return;
  await renameCollection(id, name.trim());
  revalidatePath(`/collections/${id}`);
  revalidatePath("/collections");
}

export async function deleteCollectionAction(id: string): Promise<void> {
  await deleteCollection(id);
  revalidatePath("/collections");
}

export async function addFilmToCollectionAction(collectionId: string, filmId: string): Promise<void> {
  await addFilmToCollection(collectionId, filmId);
  revalidatePath(`/collections/${collectionId}`);
  revalidatePath("/collections");
  revalidatePath(`/film/${filmId}`);
}

/** Used from the "add to collection" menu on a film's own page — creates the collection and adds
 * this film to it in one step, without the redirect createCollectionAction does. */
export async function createCollectionAndAddFilmAction(name: string, filmId: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const collection = await createCollection(trimmed);
  await addFilmToCollection(collection.id, filmId);
  revalidatePath("/collections");
  revalidatePath(`/film/${filmId}`);
  return collection;
}

export async function removeFilmFromCollectionAction(collectionId: string, filmId: string): Promise<void> {
  await removeFilmFromCollection(collectionId, filmId);
  revalidatePath(`/collections/${collectionId}`);
  revalidatePath("/collections");
  revalidatePath(`/film/${filmId}`);
}
