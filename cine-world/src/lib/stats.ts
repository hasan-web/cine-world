import { CLUSTERS } from "@/data/clusters";
import type { Viewing } from "@/lib/diary";
import type { Cluster, Film } from "@/lib/types";

export interface Bar {
  label: string;
  count: number;
  /** 0-1, relative to the largest bar — what the UI actually scales by. */
  fraction: number;
}

export interface MoodShare {
  cluster: Cluster;
  count: number;
  fraction: number;
}

export interface Stats {
  totalFilms: number;
  totalViewings: number;
  rewatches: number;
  unplaced: number;
  averageRating: number;
  /** Distinct release decades represented, most-watched first. */
  decades: Bar[];
  ratings: Bar[];
  moods: MoodShare[];
  /** Viewing activity over the last 12 months, oldest first, including empty months. */
  activity: Bar[];
  directors: Bar[];
  mostRewatched: Array<{ filmId: string; title: string; viewings: number }>;
  firstViewing?: string;
  /** How many films carry a director at all — imports don't, so the list needs a caveat. */
  filmsWithDirector: number;
}

function toBars(counts: Map<string, number>, limit?: number): Bar[] {
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const capped = limit ? entries.slice(0, limit) : entries;
  const max = capped[0]?.[1] ?? 1;
  return capped.map(([label, count]) => ({ label, count, fraction: count / max }));
}

/** The previous 12 months as YYYY-MM, oldest first, derived without Date arithmetic drift. */
function recentMonthKeys(today: Date, span = 12): string[] {
  const keys: string[] = [];
  let year = today.getUTCFullYear();
  let month = today.getUTCMonth(); // 0-indexed

  for (let i = 0; i < span; i++) {
    keys.push(`${year}-${String(month + 1).padStart(2, "0")}`);
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
  }

  return keys.reverse();
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function buildStats(films: Film[], viewings: Viewing[], today = new Date()): Stats {
  const rewatches = viewings.filter((v) => v.isRewatch).length;

  // Rating distribution is over viewings rather than films, so a rewatch you felt differently
  // about counts as its own opinion instead of being hidden behind the first one.
  const ratingCounts = new Map<string, number>();
  for (let star = 5; star >= 1; star--) ratingCounts.set(`${star}`, 0);
  for (const v of viewings) {
    const key = `${v.rating}`;
    ratingCounts.set(key, (ratingCounts.get(key) ?? 0) + 1);
  }
  const maxRating = Math.max(1, ...ratingCounts.values());
  const ratings: Bar[] = [...ratingCounts.entries()].map(([label, count]) => ({
    label,
    count,
    fraction: count / maxRating,
  }));

  const moodCounts = new Map(CLUSTERS.map((c) => [c.id, 0]));
  let placed = 0;
  for (const film of films) {
    if (!film.cluster) continue;
    placed++;
    moodCounts.set(film.cluster, (moodCounts.get(film.cluster) ?? 0) + 1);
  }
  const moods: MoodShare[] = CLUSTERS.map((cluster) => {
    const count = moodCounts.get(cluster.id) ?? 0;
    return { cluster, count, fraction: placed > 0 ? count / placed : 0 };
  }).sort((a, b) => b.count - a.count);

  const decadeCounts = new Map<string, number>();
  for (const film of films) {
    if (!film.year) continue;
    const decade = Math.floor(film.year / 10) * 10;
    const label = `${decade}s`;
    decadeCounts.set(label, (decadeCounts.get(label) ?? 0) + 1);
  }

  const directorCounts = new Map<string, number>();
  let filmsWithDirector = 0;
  for (const film of films) {
    // Imported films have no director, and lumping them under "" would win this list outright.
    if (!film.director) continue;
    filmsWithDirector++;
    directorCounts.set(film.director, (directorCounts.get(film.director) ?? 0) + 1);
  }

  const monthCounts = new Map<string, number>();
  for (const v of viewings) {
    const key = v.date.slice(0, 7);
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  const months = recentMonthKeys(today);
  const maxMonth = Math.max(1, ...months.map((m) => monthCounts.get(m) ?? 0));
  const activity: Bar[] = months.map((key) => ({
    label: SHORT_MONTHS[Number(key.slice(5, 7)) - 1],
    count: monthCounts.get(key) ?? 0,
    fraction: (monthCounts.get(key) ?? 0) / maxMonth,
  }));

  const mostRewatched = films
    .map((f) => ({ filmId: f.id, title: f.title, viewings: 1 + (f.rewatches?.length ?? 0) }))
    .filter((f) => f.viewings > 1)
    .sort((a, b) => b.viewings - a.viewings)
    .slice(0, 5);

  const ratingTotal = viewings.reduce((sum, v) => sum + v.rating, 0);

  return {
    totalFilms: films.length,
    totalViewings: viewings.length,
    rewatches,
    unplaced: films.length - placed,
    averageRating: viewings.length > 0 ? ratingTotal / viewings.length : 0,
    decades: toBars(decadeCounts).sort((a, b) => a.label.localeCompare(b.label)),
    ratings,
    moods,
    activity,
    directors: toBars(directorCounts, 6),
    mostRewatched,
    // viewings is sorted newest-first, so the oldest is the last entry.
    firstViewing: viewings[viewings.length - 1]?.date,
    filmsWithDirector,
  };
}
