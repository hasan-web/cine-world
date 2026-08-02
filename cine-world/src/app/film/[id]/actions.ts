"use server";

import { revalidatePath } from "next/cache";
import { addRewatch } from "@/lib/films";

export interface LogRewatchState {
  error?: string;
}

export async function logRewatch(
  filmId: string,
  _prevState: LogRewatchState,
  formData: FormData,
): Promise<LogRewatchState> {
  const year = Number(formData.get("year"));
  const rating = Number(formData.get("rating"));

  if (!Number.isFinite(year) || year < 1888 || year > new Date().getFullYear() + 1) {
    return { error: "Enter a valid year." };
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Pick a rating from 1 to 5." };
  }

  await addRewatch(filmId, { year, rating });
  revalidatePath(`/film/${filmId}`);
  revalidatePath("/collection");
  return {};
}
