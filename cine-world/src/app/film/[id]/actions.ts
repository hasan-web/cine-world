"use server";

import { revalidatePath } from "next/cache";
import { addRewatch } from "@/lib/films";
import type { ClusterId, Rewatch } from "@/lib/types";

const VALID_CLUSTERS: ClusterId[] = ["solitudo", "amplitudo", "domus", "lacrima"];

export interface LogRewatchState {
  error?: string;
  addedRewatch?: Rewatch;
}

export async function logRewatch(
  filmId: string,
  _prevState: LogRewatchState,
  formData: FormData,
): Promise<LogRewatchState> {
  const date = String(formData.get("date") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const cluster = String(formData.get("cluster") ?? "") as ClusterId;
  const note = String(formData.get("note") ?? "").trim() || undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Enter a valid date." };
  }
  const year = Number(date.slice(0, 4));
  if (year < 1888 || year > new Date().getFullYear() + 1) {
    return { error: "Enter a valid date." };
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Pick a rating from 1 to 5." };
  }
  if (!VALID_CLUSTERS.includes(cluster)) {
    return { error: "Pick a mood." };
  }

  const addedRewatch: Rewatch = { date, year, rating, cluster, note };
  await addRewatch(filmId, addedRewatch);
  revalidatePath(`/film/${filmId}`);
  revalidatePath("/collection");
  return { addedRewatch };
}
