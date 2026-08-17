/**
 * A film's id within one person's collection.
 *
 * The year is part of the id on purpose. Before it was, the id was just the slugified title, so
 * Dune (1984) and Dune (2021) both produced "dune" — and because a duplicate id is treated as
 * "you've already logged this", the second one silently became a rewatch of the first. Remakes,
 * reboots and shared titles are common enough that a bulk import would hit this constantly.
 *
 * Being a pure function of title and year also makes importing idempotent: running the same
 * Letterboxd export twice generates the same ids, so the second run inserts nothing rather than
 * duplicating a library.
 */
export function filmId(title: string, year: number | null): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // A title of only punctuation would slug to "" — fall back so the id is never empty or bare.
  const base = slug || "film";
  return year && Number.isFinite(year) ? `${base}-${year}` : base;
}
