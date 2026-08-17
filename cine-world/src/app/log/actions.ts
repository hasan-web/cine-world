"use server";

import { redirect } from "next/navigation";
import { addRewatch, createFilm } from "@/lib/films";
import type { ClusterId } from "@/lib/types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface LogFilmState {
  error?: string;
}

export async function logFilm(_prevState: LogFilmState, formData: FormData): Promise<LogFilmState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Give the specimen a title." };
  }

  const id = slugify(title);
  const year = Number(formData.get("year")) || new Date().getFullYear();
  const rating = Number(formData.get("rating")) || 3;
  const cluster = String(formData.get("cluster") ?? "solitudo") as ClusterId;
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const watchedOnInput = String(formData.get("watchedOn") ?? "").trim();
  const watchedOn = /^\d{4}-\d{2}-\d{2}$/.test(watchedOnInput) ? watchedOnInput : todayIso();

  const { alreadyExists } = await createFilm({
    id,
    title,
    director: String(formData.get("director") ?? "").trim() || "unknown",
    year,
    country: String(formData.get("country") ?? "").trim() || "unknown",
    rating,
    cluster,
    note,
    watchedOn,
  });

  if (alreadyExists) {
    // You already have this one — this submission becomes a new viewing event
    // instead of silently overwriting your original entry.
    await addRewatch(id, { date: watchedOn, year: Number(watchedOn.slice(0, 4)), rating, cluster, note });
    redirect(`/film/${id}`);
  }

  redirect(`/film/${id}?new=1`);
}
