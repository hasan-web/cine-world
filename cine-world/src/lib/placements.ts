import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { ClusterId } from "@/lib/types";

/** filmId → how many people placed it in each mood. A film absent from this map is one that hasn't
 * cleared the anonymization floor yet (see public_placement_split in schema.sql). */
export type PlacementSplit = Record<string, Partial<Record<ClusterId, number>>>;

interface SplitRow {
  film_id: string;
  cluster: ClusterId;
  placements: number | string;
}

/**
 * Crowd placements for the public game. Uses the cookie-free client for the same reason
 * getPublicFilmStats() does — reading cookies here would drop a static marketing page into
 * per-request rendering for data that has nothing to do with the visitor.
 *
 * Returns {} rather than throwing on failure, deliberately: the crowd numbers are an enhancement
 * over comparing against the catalogue, and the page has a complete, working fallback without them.
 * A page whose entire job is converting cold traffic should never 500 over a nice-to-have.
 */
export async function getPlacementSplit(filmIds: string[]): Promise<PlacementSplit> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("public_placement_split", { p_film_ids: filmIds });
  if (error) return {};

  const split: PlacementSplit = {};
  for (const row of (data ?? []) as SplitRow[]) {
    split[row.film_id] ??= {};
    split[row.film_id][row.cluster] = Number(row.placements);
  }
  return split;
}
