import type { ClusterId, Film } from "@/lib/types";

/**
 * One occasion of watching something.
 *
 * The collection stores a film once with its rewatches folded into a jsonb array, which is the
 * right shape for a sky — one film, one star. A diary wants the opposite: every viewing as its
 * own entry on a date, so a film watched three times appears three times. This flattens one into
 * the other, so the diary needs no extra storage and no second query.
 */
export interface Viewing {
  filmId: string;
  title: string;
  /** The film's release year, not when it was watched. */
  year: number;
  /** ISO YYYY-MM-DD. */
  date: string;
  rating: number;
  cluster: ClusterId | null;
  note?: string;
  isRewatch: boolean;
}

/** Older rewatches predate real dates and only carry a year; sort them from its start. */
function rewatchDate(year: number, date?: string): string {
  return date ?? `${year}-01-01`;
}

/** Every viewing across every film, newest first. */
export function buildDiary(films: Film[]): Viewing[] {
  const viewings: Viewing[] = [];

  for (const film of films) {
    if (film.watchedOn) {
      viewings.push({
        filmId: film.id,
        title: film.title,
        year: film.year,
        date: film.watchedOn,
        rating: film.rating,
        cluster: film.cluster,
        note: film.note,
        isRewatch: false,
      });
    }

    for (const rewatch of film.rewatches ?? []) {
      viewings.push({
        filmId: film.id,
        title: film.title,
        year: film.year,
        date: rewatchDate(rewatch.year, rewatch.date),
        rating: rewatch.rating,
        // A rewatch can land in a different mood than the first viewing — that drift is the
        // point. Falls back to the film's own mood when the rewatch didn't record one.
        cluster: rewatch.cluster ?? film.cluster,
        note: rewatch.note,
        isRewatch: true,
      });
    }
  }

  return viewings.sort((a, b) => b.date.localeCompare(a.date));
}

export interface DiaryMonth {
  /** YYYY-MM, used as a stable key. */
  key: string;
  label: string;
  viewings: Viewing[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Formats YYYY-MM as "March 2024" without going through Date, which would apply a timezone. */
export function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const index = Number(month) - 1;
  return `${MONTH_NAMES[index] ?? month} ${year}`;
}

/** Groups an already-sorted diary into months, preserving order. */
export function groupByMonth(viewings: Viewing[]): DiaryMonth[] {
  const months: DiaryMonth[] = [];

  for (const viewing of viewings) {
    const key = viewing.date.slice(0, 7);
    const current = months[months.length - 1];
    if (current?.key === key) {
      current.viewings.push(viewing);
    } else {
      months.push({ key, label: monthLabel(key), viewings: [viewing] });
    }
  }

  return months;
}
