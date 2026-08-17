"use server";

import { revalidatePath } from "next/cache";
import {
  MAX_FILMS_PER_USER,
  MAX_IMPORT_ROWS,
  countFilms,
  discardUnplacedFilms,
  insertImportedFilms,
} from "@/lib/films";
import { parseLetterboxdCsv } from "@/lib/letterboxd";

/**
 * Matches the serverActions.bodySizeLimit in next.config.ts. Checked here as well so an
 * oversized file gets a useful message rather than a framework-level rejection.
 */
const MAX_FILE_BYTES = 2 * 1024 * 1024;

export interface ImportState {
  error?: string;
  result?: {
    imported: number;
    alreadyHad: number;
    unreadable: number;
    /** Rows dropped because they'd have pushed the account past its cap. */
    overCap: number;
  };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function importLetterboxd(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .csv file from your Letterboxd export." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      error: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB, over the 2MB limit. ratings.csv or watched.csv from your export will be well under it.`,
    };
  }

  const text = await file.text();
  const { films, skipped } = parseLetterboxdCsv(text, todayIso());

  if (films.length === 0) {
    return {
      error:
        skipped > 0
          ? "Every row in that file was unreadable — check you picked a .csv from the Letterboxd export."
          : "No films found in that file. Try ratings.csv, diary.csv or watched.csv from your export.",
    };
  }

  // Two ceilings apply: how much one import may add, and how much the account may hold in total.
  // Both exist so a single library can't consume the database on everyone else's behalf.
  const existing = await countFilms();
  const roomLeft = Math.max(0, MAX_FILMS_PER_USER - existing);
  const allowed = Math.min(films.length, MAX_IMPORT_ROWS, roomLeft);

  if (allowed === 0) {
    return {
      error: `Your collection is already at the ${MAX_FILMS_PER_USER.toLocaleString()} film limit, so there's no room to import into.`,
    };
  }

  const toImport = films.slice(0, allowed);
  const inserted = await insertImportedFilms(
    toImport.map((f) => ({
      id: f.id,
      title: f.title,
      // A Letterboxd export carries neither of these, and looking each one up would mean a TMDB
      // request per film — thousands of calls for a large library. Left blank rather than guessed.
      director: "",
      country: "",
      year: f.year,
      rating: f.rating,
      note: f.note,
      rewatches: f.rewatches,
      watchedOn: f.watchedOn,
    })),
  );

  revalidatePath("/collection");
  revalidatePath("/place");

  return {
    result: {
      imported: inserted,
      // Anything we tried to insert but didn't was already in the collection — the insert ignores
      // conflicts rather than overwriting, so re-running the same export adds nothing.
      alreadyHad: toImport.length - inserted,
      unreadable: skipped,
      overCap: films.length - allowed,
    },
  };
}

/**
 * Throws away everything still unplaced — the undo for an import someone regrets. Called
 * directly rather than through a form, since it takes no input beyond the confirmation.
 */
export async function discardImported(): Promise<{ discarded: number }> {
  const discarded = await discardUnplacedFilms();
  revalidatePath("/collection");
  revalidatePath("/place");
  return { discarded };
}
