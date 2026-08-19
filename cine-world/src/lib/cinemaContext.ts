import "server-only";
import { CLUSTERS } from "@/data/clusters";
import type { Film } from "@/lib/types";

/** Bounds prompt size for a heavily-imported collection — recent viewing history matters more
 * than completeness for grounding taste questions, and the header below says so explicitly. */
const MAX_FILMS_IN_CONTEXT = 220;

function clusterLabel(id: Film["cluster"]): string {
  if (!id) return "unplaced (no mood assigned)";
  const cluster = CLUSTERS.find((c) => c.id === id);
  return cluster ? `${cluster.label} — ${cluster.mood}` : id;
}

/** Turns a user's collection into a bounded, grounding text block for the LLM's system prompt. */
export function buildFilmContext(films: Film[]): string {
  if (films.length === 0) return "This person hasn't logged any films yet.";

  const recent = [...films]
    .sort((a, b) => (b.watchedOn ?? "").localeCompare(a.watchedOn ?? ""))
    .slice(0, MAX_FILMS_IN_CONTEXT);

  const lines = recent.map((f) => {
    const parts = [
      `"${f.title}" (${f.year}${f.director ? `, dir. ${f.director}` : ""})`,
      `mood: ${clusterLabel(f.cluster)}`,
      `rating: ${f.rating}/5`,
      `watched: ${f.watchedOn ?? "unknown date"}`,
    ];
    const rewatchCount = f.rewatches?.length ?? 0;
    if (rewatchCount > 0) parts.push(`rewatched ${rewatchCount}×`);
    if (f.note) parts.push(`note: "${f.note}"`);
    return `- ${parts.join(" · ")}`;
  });

  const omitted = films.length - recent.length;
  const header =
    omitted > 0
      ? `Showing the ${recent.length} most recently watched of ${films.length} total logged films (oldest ${omitted} omitted for length):`
      : `All ${films.length} logged films:`;

  return `${header}\n${lines.join("\n")}`;
}
