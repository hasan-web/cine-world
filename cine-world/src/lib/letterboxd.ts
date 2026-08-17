import { filmId } from "@/lib/film-id";
import type { Rewatch } from "@/lib/types";

/**
 * Parsing a Letterboxd export.
 *
 * Letterboxd hands you a zip of several CSVs — ratings.csv, diary.csv, watched.csv, reviews.csv —
 * which differ in their columns but overlap in the ones that matter. Rather than demand a
 * specific file, we read the header row and work with whichever of those columns are present, so
 * any of them imports.
 */

/** Reviews can run to essays; we keep the opening as a note and drop the rest. */
const MAX_NOTE_LENGTH = 500;

/** A single film can't carry an unbounded viewing history in one jsonb column. */
const MAX_REWATCHES_PER_FILM = 50;

export interface ParsedFilm {
  id: string;
  title: string;
  year: number;
  rating: number;
  note?: string;
  watchedOn: string;
  rewatches: Rewatch[];
}

export interface ParseResult {
  films: ParsedFilm[];
  /** Rows we couldn't read — almost always a missing title. Surfaced so the count is honest. */
  skipped: number;
}

/**
 * A minimal RFC 4180 reader. Letterboxd quotes any field containing a comma, and film titles
 * ("Hello, Dolly!") and reviews routinely do, so splitting on commas would corrupt real
 * libraries. Handles quoted fields, escaped quotes (""), embedded newlines, and CRLF.
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  // A BOM survives Excel round-trips and would otherwise corrupt the first header name.
  if (input.charCodeAt(0) === 0xfeff) i = 1;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    // Ignore the trailing empty line virtually every CSV ends with.
    if (row.length > 1 || row[0] !== "") rows.push(row);
    row = [];
  };

  while (i < input.length) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      pushField();
      i++;
      continue;
    }
    if (char === "\r") {
      // Swallow CRLF as one break.
      if (input[i + 1] === "\n") i++;
      pushRow();
      i++;
      continue;
    }
    if (char === "\n") {
      pushRow();
      i++;
      continue;
    }

    field += char;
    i++;
  }

  // Whatever is buffered when input ends is a final row, unless the file ended on a clean break.
  if (field !== "" || row.length > 0) pushRow();

  return rows;
}

/** Locates a column by header name, case- and space-insensitively. Returns -1 when absent. */
function columnIndex(header: string[], ...names: string[]): number {
  const normalized = header.map((h) => h.trim().toLowerCase());
  for (const name of names) {
    const found = normalized.indexOf(name.toLowerCase());
    if (found !== -1) return found;
  }
  return -1;
}

/**
 * Letterboxd rates in half-stars from 0.5 to 5; we store whole stars from 1 to 5. Rounding up
 * from a half star means a 0.5 becomes a 1 rather than a 0, which the rating check would reject.
 * Unrated entries are extremely common in a `watched.csv`, and get a neutral 3.
 */
function convertRating(raw: string | undefined): number {
  if (!raw) return 3;
  const value = Number(raw.trim());
  if (!Number.isFinite(value) || value <= 0) return 3;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function parseYear(raw: string | undefined): number {
  const value = Number((raw ?? "").trim());
  // Guards against a stray "N/A" and against a year so implausible it's a parse error.
  return Number.isFinite(value) && value >= 1870 && value <= 2200 ? value : 0;
}

function parseDate(raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

/**
 * Turns an export into films. Repeat entries for the same title collapse into one film with a
 * rewatch history rather than several rows — a diary export lists every viewing, and storing
 * each as its own film would both misrepresent the collection and multiply what it costs to keep.
 */
export function parseLetterboxdCsv(input: string, today: string): ParseResult {
  const rows = parseCsv(input);
  if (rows.length < 2) return { films: [], skipped: 0 };

  const header = rows[0];
  const nameCol = columnIndex(header, "Name", "Title");
  const yearCol = columnIndex(header, "Year");
  const ratingCol = columnIndex(header, "Rating");
  const reviewCol = columnIndex(header, "Review");
  // diary.csv carries the real viewing date in "Watched Date"; the plain "Date" column in
  // ratings.csv is when the entry was created, which is the best available fallback.
  const dateCol = columnIndex(header, "Watched Date", "Date");

  if (nameCol === -1) return { films: [], skipped: 0 };

  const byId = new Map<string, ParsedFilm>();
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const title = (row[nameCol] ?? "").trim();
    if (!title) {
      skipped++;
      continue;
    }

    const year = parseYear(row[yearCol]);
    const rating = convertRating(row[ratingCol]);
    const watchedOn = parseDate(row[dateCol]) ?? today;
    const review = reviewCol === -1 ? "" : (row[reviewCol] ?? "").trim();
    const note = review ? review.slice(0, MAX_NOTE_LENGTH) : undefined;
    const id = filmId(title, year || null);

    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, { id, title, year, rating, note, watchedOn, rewatches: [] });
      continue;
    }

    // A second sighting of the same film. The earliest viewing stays the original entry and
    // later ones become rewatches, so the record reads chronologically the way it actually went.
    if (watchedOn < existing.watchedOn) {
      existing.rewatches.push({
        date: existing.watchedOn,
        year: Number(existing.watchedOn.slice(0, 4)),
        rating: existing.rating,
        note: existing.note,
      });
      existing.watchedOn = watchedOn;
      existing.rating = rating;
      existing.note = note;
    } else if (existing.rewatches.length < MAX_REWATCHES_PER_FILM) {
      existing.rewatches.push({ date: watchedOn, year: Number(watchedOn.slice(0, 4)), rating, note });
    }
  }

  const films = [...byId.values()].map((film) => ({
    ...film,
    rewatches: film.rewatches.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")),
  }));

  return { films, skipped };
}
