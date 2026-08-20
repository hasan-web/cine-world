import { CATALOG, type CatalogFilm } from "@/data/catalog";
import type { ClusterId } from "@/lib/types";

/**
 * The eight films the public placement game opens with, and the bench it swaps from when a player
 * hasn't seen one.
 *
 * Picked for disagreement rather than fame. A film everyone files identically produces a boring
 * result and no reason to share it, so every title here is one that can be honestly defended in at
 * least two moods — Eternal Sunshine as an epic or a wreck, Shoplifters as comfort or devastation.
 * The eight are also balanced two-per-mood against the catalogue's own placements, so the "right"
 * answer is never the same button twice running.
 *
 * Both lists are catalogue slugs rather than free-floating titles, which matters twice over: a
 * catalogue slug is identical to filmId(title, year) (see film-id.ts), so crowd placements line up
 * with the same id real logged films use, and claimPlacements() can resolve every answer back to a
 * real catalogue entry server-side instead of trusting anything the client sends.
 */
const OPENING_SLUGS = [
  "eternal-sunshine-of-the-spotless-mind-2004",
  "lost-in-translation-2003",
  "shoplifters-2018",
  "moonlight-2016",
  "ratatouille-2007",
  "her-2013",
  "past-lives-2023",
  "the-worst-person-in-the-world-2021",
];

const BENCH_SLUGS = [
  "amelie-2001",
  "before-sunset-2004",
  "portrait-of-a-lady-on-fire-2019",
  "burning-2018",
  "aftersun-2022",
  "chungking-express-1994",
  "perfect-days-2023",
  "in-the-mood-for-love-2000",
  "columbus-2017",
  "drive-my-car-2021",
];

function bySlug(slugs: string[]): CatalogFilm[] {
  return slugs
    .map((slug) => CATALOG.find((f) => f.slug === slug))
    .filter((f): f is CatalogFilm => f !== undefined);
}

export const QUIZ_OPENING: CatalogFilm[] = bySlug(OPENING_SLUGS);
export const QUIZ_BENCH: CatalogFilm[] = bySlug(BENCH_SLUGS);

/** Every film the game can possibly show — the set claimPlacements() validates answers against. */
export const QUIZ_POOL: CatalogFilm[] = [...QUIZ_OPENING, ...QUIZ_BENCH];

export const QUIZ_LENGTH = QUIZ_OPENING.length;

export interface Archetype {
  name: string;
  tagline: string;
}

const DOMINANT: Record<ClusterId, Archetype> = {
  solitudo: { name: "The Patient Watcher", tagline: "stays in a feeling longer than most people will" },
  amplitudo: { name: "The Wide Screen", tagline: "wants a film to hold a whole life at once" },
  domus: { name: "The Comfort Keeper", tagline: "returns to things rather than replacing them" },
  lacrima: { name: "The Deep End", tagline: "goes looking for the ones that leave a mark" },
};

const EVEN: Archetype = {
  name: "The Omnivore",
  tagline: "files by feeling each time, not by habit",
};

/**
 * Named deterministically from the mood spread rather than by a model — it costs nothing, can't be
 * abused by anonymous traffic, returns instantly, and two people with the same eight answers get
 * the same name, which matters for something built to be compared in a comment thread.
 */
export function archetypeFor(counts: Record<ClusterId, number>): Archetype {
  const entries = Object.entries(counts) as Array<[ClusterId, number]>;
  const [topCluster, topCount] = entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best));
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  // Nothing above a quarter-plus-one of the answers isn't a lean, it's a shrug — and calling that
  // "The Deep End" on a 3/2/2/1 split would be the kind of overclaim this card exists not to make.
  if (total === 0 || topCount <= Math.ceil(total / 4)) return EVEN;
  return DOMINANT[topCluster];
}
