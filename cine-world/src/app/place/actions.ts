"use server";

import { revalidatePath } from "next/cache";
import { placeFilm } from "@/lib/films";
import type { ClusterId } from "@/lib/types";

const VALID_CLUSTERS: ClusterId[] = ["solitudo", "amplitudo", "domus", "lacrima"];

export interface PlaceState {
  error?: string;
  placed?: number;
}

export async function place(_prev: PlaceState, formData: FormData): Promise<PlaceState> {
  const filmId = String(formData.get("filmId") ?? "").trim();
  const cluster = String(formData.get("cluster") ?? "") as ClusterId;

  if (!filmId) return { error: "Missing film." };
  if (!VALID_CLUSTERS.includes(cluster)) return { error: "Pick one of the four moods." };

  await placeFilm(filmId, cluster);

  revalidatePath("/place");
  revalidatePath("/collection");

  return { placed: 1 };
}
