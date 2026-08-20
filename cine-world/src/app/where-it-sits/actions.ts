"use server";

import { revalidatePath } from "next/cache";
import { CLUSTERS } from "@/data/clusters";
import { QUIZ_POOL, QUIZ_LENGTH } from "@/data/quiz";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { ClusterId } from "@/lib/types";

/**
 * The game asks where a film sat, not how much it mattered, so there is no honest rating to carry
 * over — a neutral 3 is the least-wrong placeholder, and the button that calls this says so plainly
 * rather than letting someone discover eight invented ratings in their diary later.
 */
const DEFAULT_RATING = 3;

export interface ClaimResult {
  added?: number;
  error?: string;
}

export interface ClaimedPlacement {
  slug: string;
  cluster: string;
}

const VALID_CLUSTERS = new Set<string>(CLUSTERS.map((c) => c.id));

/**
 * Turns a finished game into real specimens in the player's sky.
 *
 * Everything except "which mood did they pick" is resolved from the catalogue server-side: the
 * client sends a slug, not a title/year/director, so the worst a crafted payload can do is place a
 * film from the game's own pool into a mood the player didn't choose — their own collection, their
 * own row. Insert is `ignoreDuplicates`, the same guarantee insertImportedFilms() makes, so
 * replaying the game can never overwrite a mood, rating or note set by hand afterwards.
 */
export async function claimPlacements(placements: ClaimedPlacement[]): Promise<ClaimResult> {
  const user = await verifySession();

  if (!Array.isArray(placements) || placements.length === 0) {
    return { error: "Nothing to add." };
  }
  if (placements.length > QUIZ_LENGTH) {
    return { error: "That's more placements than the game has films." };
  }

  const rows = [];
  const seen = new Set<string>();
  for (const placement of placements) {
    const film = QUIZ_POOL.find((f) => f.slug === placement?.slug);
    if (!film || !VALID_CLUSTERS.has(placement.cluster) || seen.has(film.slug)) continue;
    seen.add(film.slug);
    rows.push({
      id: film.slug,
      user_id: user.id,
      title: film.title,
      director: film.director,
      year: film.year,
      country: film.country,
      rating: DEFAULT_RATING,
      cluster: placement.cluster as ClusterId,
      note: null,
    });
  }

  if (rows.length === 0) return { error: "Nothing to add." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("films")
    .upsert(rows, { onConflict: "user_id,id", ignoreDuplicates: true })
    .select("id");

  if (error) return { error: "Couldn't save these just now. Try again in a moment." };

  revalidatePath("/collection");
  revalidatePath("/diary");
  return { added: data?.length ?? 0 };
}
