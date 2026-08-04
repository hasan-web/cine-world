"use server";

import { redirect } from "next/navigation";
import { createFilm } from "@/lib/films";
import type { ClusterId } from "@/lib/types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  await createFilm({
    id,
    title,
    director: String(formData.get("director") ?? "").trim() || "unknown",
    year,
    country: String(formData.get("country") ?? "").trim() || "unknown",
    rating,
    cluster,
    note: String(formData.get("note") ?? "").trim() || undefined,
  });

  redirect(`/film/${id}?new=1`);
}
