import type { ClusterId } from "@/lib/types";

/**
 * A small, hand-picked public film catalog — real titles, real directors, real years — used to
 * back the SEO-facing /movies, /movies-like, and /moods pages. This is deliberately separate from
 * the private, RLS-locked `films` table: nothing here is a user's personal log, and nothing here
 * is fabricated. Overviews are factual capsule descriptions; themes are honest editorial framing,
 * not invented ratings or reviews.
 */
export interface CatalogFilm {
  slug: string;
  title: string;
  director: string;
  year: number;
  country: string;
  /** Which of the app's four real moods this film sits in — reused, not a separate taxonomy. */
  cluster: ClusterId;
  /** Short thematic tags, used to compute genuine "movies like this" overlap. */
  themes: string[];
  /** 1-2 sentence factual premise. */
  overview: string;
  /** Custom opening line for this film's /movies-like page — only used when that page exists. */
  likeIntro?: string;
}

export const CATALOG: CatalogFilm[] = [
  {
    slug: "chungking-express-1994",
    title: "Chungking Express",
    director: "Wong Kar-wai",
    year: 1994,
    country: "Hong Kong",
    cluster: "solitudo",
    themes: ["memory", "longing", "urban solitude", "chance encounters"],
    overview:
      "Two loosely linked stories of Hong Kong police officers working through heartbreak — one drawn to a woman in a blonde wig running from a drug deal, the other falling for a snack-bar worker who lets herself into his apartment while he's out.",
    likeIntro:
      "Chungking Express runs on coincidence and near-misses — strangers circling each other in a crowded city without quite connecting. These films work the same wavelength.",
  },
  {
    slug: "in-the-mood-for-love-2000",
    title: "In the Mood for Love",
    director: "Wong Kar-wai",
    year: 2000,
    country: "Hong Kong",
    cluster: "lacrima",
    themes: ["longing", "restraint", "unspoken love", "urban solitude"],
    overview:
      "Two neighbors in 1962 Hong Kong, each married to someone secretly having an affair with the other's spouse, grow close while resisting becoming what their partners already are.",
    likeIntro:
      "In the Mood for Love is about everything two people don't say to each other. If that ache is what you're after, these hold it too.",
  },
  {
    slug: "paris-texas-1984",
    title: "Paris, Texas",
    director: "Wim Wenders",
    year: 1984,
    country: "West Germany",
    cluster: "solitudo",
    themes: ["silence", "estrangement", "redemption", "quiet devastation"],
    overview:
      "A man wanders out of the desert after four years of silence and slowly tries to reassemble the family he walked away from, reuniting his young son with the mother neither of them can quite face.",
    likeIntro:
      "Paris, Texas moves at the pace of a man relearning how to speak. These films sit in that same quiet, unhurried devastation.",
  },
  {
    slug: "aftersun-2022",
    title: "Aftersun",
    director: "Charlotte Wells",
    year: 2022,
    country: "United Kingdom",
    cluster: "lacrima",
    themes: ["memory", "quiet devastation", "hindsight", "parenthood"],
    overview:
      "A woman revisits camcorder footage from a holiday she took with her father as an 11-year-old in Turkey, piecing together, as an adult, what he was actually going through that she couldn't see at the time.",
    likeIntro:
      "Aftersun is a memory you only understand years later. These films work the same way — the meaning arrives after the fact.",
  },
  {
    slug: "perfect-days-2023",
    title: "Perfect Days",
    director: "Wim Wenders",
    year: 2023,
    country: "Japan",
    cluster: "domus",
    themes: ["quiet ritual", "contentment", "solitude", "small pleasures"],
    overview:
      "A Tokyo toilet cleaner's meticulously ordered daily routine — cassette tapes, sandwich lunches, the same trees photographed every day — quietly reveals a life built entirely out of small, chosen rituals.",
    likeIntro:
      "Perfect Days finds a whole life in a routine most people would overlook. These films find the same thing in small, repeated gestures.",
  },
  {
    slug: "portrait-of-a-lady-on-fire-2019",
    title: "Portrait of a Lady on Fire",
    director: "Céline Sciamma",
    year: 2019,
    country: "France",
    cluster: "lacrima",
    themes: ["longing", "forbidden love", "quiet devastation", "female gaze"],
    overview:
      "A painter is secretly hired to paint a young woman's wedding portrait on a remote island, and the two fall into a brief, consuming relationship that both know cannot survive it.",
    likeIntro:
      "Portrait of a Lady on Fire is a love story with an ending built into it from the start. These films carry that same foreknowledge.",
  },
  {
    slug: "columbus-2017",
    title: "Columbus",
    director: "Kogonada",
    year: 2017,
    country: "United States",
    cluster: "solitudo",
    themes: ["quiet friendship", "stillness", "architecture", "stuck in place"],
    overview:
      "A young woman who has put her own life on hold to care for her mother forms an unlikely friendship with a visitor stranded in Columbus, Indiana, as they talk through the town's modernist architecture.",
  },
  {
    slug: "drive-my-car-2021",
    title: "Drive My Car",
    director: "Ryusuke Hamaguchi",
    year: 2021,
    country: "Japan",
    cluster: "solitudo",
    themes: ["grief", "unspoken love", "quiet ritual", "reckoning"],
    overview:
      "A theater director staging a multilingual production of Uncle Vanya is assigned a young driver, and their long daily commutes gradually surface what he's never been able to say about his late wife.",
    likeIntro:
      "Drive My Car takes its time getting to the thing its characters can't say out loud. These films are built around the same kind of delay.",
  },
  {
    slug: "past-lives-2023",
    title: "Past Lives",
    director: "Celine Song",
    year: 2023,
    country: "United States",
    cluster: "lacrima",
    themes: ["longing", "roads not taken", "unspoken love", "memory"],
    overview:
      "Childhood sweethearts separated when one emigrates from Korea reconnect twice — first online in their twenties, then in person in New York, where one of them is now married to someone else.",
    likeIntro:
      "Past Lives is about the life you didn't choose, still visible from where you're standing. These films sit with that same what-if.",
  },
  {
    slug: "blue-valentine-2010",
    title: "Blue Valentine",
    director: "Derek Cianfrance",
    year: 2010,
    country: "United States",
    cluster: "lacrima",
    themes: ["heartbreak", "disillusionment", "quiet devastation", "marriage"],
    overview:
      "A marriage's beginning and its collapse are cut together scene by scene, showing exactly how the same two people arrived at two completely different places.",
    likeIntro:
      "Blue Valentine shows a relationship from both ends at once. These films are just as honest about how love actually erodes.",
  },
  {
    slug: "eternal-sunshine-of-the-spotless-mind-2004",
    title: "Eternal Sunshine of the Spotless Mind",
    director: "Michel Gondry",
    year: 2004,
    country: "United States",
    cluster: "amplitudo",
    themes: ["heartbreak", "memory", "regret", "chaotic romance"],
    overview:
      "After a breakup, a man undergoes a procedure to erase every memory of his ex — and, partway through, changes his mind while it's already happening.",
    likeIntro:
      "Eternal Sunshine argues that even the painful memories are worth keeping. These films make the same case, differently.",
  },
  {
    slug: "before-sunset-2004",
    title: "Before Sunset",
    director: "Richard Linklater",
    year: 2004,
    country: "United States",
    cluster: "domus",
    themes: ["longing", "roads not taken", "conversation", "unresolved love"],
    overview:
      "Nine years after a single night together in Vienna, two former strangers run into each other again in Paris and spend one afternoon finding out whether it was ever really over.",
    likeIntro:
      "Before Sunset is one long conversation that's really about everything left unresolved. These films run on the same kind of talk.",
  },
  {
    slug: "amelie-2001",
    title: "Amélie",
    director: "Jean-Pierre Jeunet",
    year: 2001,
    country: "France",
    cluster: "domus",
    themes: ["whimsy", "small pleasures", "quiet ritual", "secret kindness"],
    overview:
      "A shy Montmartre waitress starts secretly engineering small interventions in the lives of people around her, while avoiding the one intervention that might change her own.",
    likeIntro:
      "Amélie finds a whole world of meaning in small, private gestures. These films share that same delight in the small stuff.",
  },
  {
    slug: "ratatouille-2007",
    title: "Ratatouille",
    director: "Brad Bird",
    year: 2007,
    country: "United States",
    cluster: "domus",
    themes: ["ambition", "found family", "small pleasures", "craft"],
    overview:
      "A rat with an exact, uncompromising sense of taste teams up with a hapless kitchen assistant to cook in one of Paris's finest restaurants, one hidden underneath his hat at a time.",
    likeIntro:
      "Ratatouille is about caring more about the craft than anyone thinks you're allowed to. These films share that same stubborn devotion.",
  },
  {
    slug: "lost-in-translation-2003",
    title: "Lost in Translation",
    director: "Sofia Coppola",
    year: 2003,
    country: "United States",
    cluster: "solitudo",
    themes: ["urban solitude", "quiet friendship", "stuck in place", "jet-lagged intimacy"],
    overview:
      "A washed-up actor and a recent college graduate, both jet-lagged and out of place in the same Tokyo hotel, spend a few days keeping each other company at exactly the right, wrong moment.",
    likeIntro:
      "Lost in Translation is two people who happen to be lonely in the same place at the same time. These films find that same accidental company.",
  },
  {
    slug: "the-worst-person-in-the-world-2021",
    title: "The Worst Person in the World",
    director: "Joachim Trier",
    year: 2021,
    country: "Norway",
    cluster: "amplitudo",
    themes: ["roads not taken", "disillusionment", "self-discovery", "chaotic romance"],
    overview:
      "Told in twelve chapters, a woman in her late twenties keeps changing course — careers, relationships, cities — trying to work out who she's supposed to become before the choice gets made for her.",
    likeIntro:
      "The Worst Person in the World is about not knowing which version of your life is the real one yet. These films are in the same uncertain place.",
  },
  {
    slug: "moonlight-2016",
    title: "Moonlight",
    director: "Barry Jenkins",
    year: 2016,
    country: "United States",
    cluster: "lacrima",
    themes: ["identity", "silence", "coming of age", "quiet devastation"],
    overview:
      "A boy growing up in Miami is shown at three points in his life — child, teenager, adult — as he works out his identity and sexuality against a home life defined by his mother's addiction.",
    likeIntro:
      "Moonlight says the most in the moments its characters stay silent. These films trust that same kind of quiet.",
  },
  {
    slug: "her-2013",
    title: "Her",
    director: "Spike Jonze",
    year: 2013,
    country: "United States",
    cluster: "solitudo",
    themes: ["loneliness", "unconventional love", "self-discovery", "technology"],
    overview:
      "A lonely writer going through a divorce falls in love with an AI operating system that seems to understand him better than anyone in his life so far has.",
  },
  {
    slug: "burning-2018",
    title: "Burning",
    director: "Lee Chang-dong",
    year: 2018,
    country: "South Korea",
    cluster: "amplitudo",
    themes: ["unease", "class tension", "obsession", "ambiguity"],
    overview:
      "A young man reconnects with a childhood friend, only for a wealthy stranger she brings back from a trip to introduce something that unsettles all three of them.",
  },
  {
    slug: "shoplifters-2018",
    title: "Shoplifters",
    director: "Hirokazu Kore-eda",
    year: 2018,
    country: "Japan",
    cluster: "domus",
    themes: ["found family", "quiet devastation", "class tension", "secret kindness"],
    overview:
      "A poor Tokyo family surviving on shoplifting and off-the-books work takes in an abandoned girl, and their makeshift household slowly reveals what actually holds a family together.",
    likeIntro:
      "Shoplifters redraws what counts as a family. These films are interested in the same question, from different angles.",
  },
];

export function getCatalogFilm(slug: string): CatalogFilm | undefined {
  return CATALOG.find((f) => f.slug === slug);
}

export function getCatalogFilmsByCluster(cluster: ClusterId): CatalogFilm[] {
  return CATALOG.filter((f) => f.cluster === cluster);
}

/** Other catalog entries from the same director — real data, used for in-page cross-links. */
export function getMoreFromDirector(slug: string): CatalogFilm[] {
  const film = getCatalogFilm(slug);
  if (!film) return [];
  return CATALOG.filter((f) => f.slug !== slug && f.director === film.director);
}

export interface RelatedFilm {
  film: CatalogFilm;
  sharedThemes: string[];
}

const MIN_RELATED_FOR_MOVIES_LIKE = 3;

/** Films that share at least one theme with the source, ranked by how many they share. */
export function getRelatedFilms(slug: string, limit = 6): RelatedFilm[] {
  const source = getCatalogFilm(slug);
  if (!source) return [];

  return CATALOG.filter((f) => f.slug !== slug)
    .map((f) => ({ film: f, sharedThemes: f.themes.filter((t) => source.themes.includes(t)) }))
    .filter((r) => r.sharedThemes.length > 0)
    .sort((a, b) => b.sharedThemes.length - a.sharedThemes.length)
    .slice(0, limit);
}

/**
 * The reusable indexation gate for /movies-like/[slug]: a film only gets that page when there's
 * genuinely enough thematic overlap with the rest of the catalog to say something real about it —
 * a handful of films (like Columbus, Her, Burning here) don't clear that bar, and simply don't get
 * a movies-like page rather than being padded out with weak matches.
 */
export function hasMoviesLikePage(slug: string): boolean {
  const film = getCatalogFilm(slug);
  return Boolean(film?.likeIntro) && getRelatedFilms(slug, 100).length >= MIN_RELATED_FOR_MOVIES_LIKE;
}
