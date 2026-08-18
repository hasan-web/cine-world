import type { PlacedFilm } from "@/lib/types";

/**
 * Fake, clearly-labeled specimens used only to show a brand-new user the shape of a feature
 * before they have real data — never mixed into real queries, never persisted. Reuses titles
 * already established as the brand's own reference points elsewhere (the manifesto, the public
 * catalog) rather than inventing new ones, so the example sky looks like it belongs to this app
 * specifically rather than a generic placeholder.
 */
export const EXAMPLE_FILMS: PlacedFilm[] = [
  {
    id: "example-amelie",
    title: "Amélie",
    director: "Jean-Pierre Jeunet",
    year: 2001,
    country: "France",
    rating: 5,
    cluster: "domus",
    note: "the kind of film you put on when you want the world to feel kinder.",
    watchedOn: "2026-01-14",
  },
  {
    id: "example-aftersun",
    title: "Aftersun",
    director: "Charlotte Wells",
    year: 2022,
    country: "United Kingdom",
    rating: 5,
    cluster: "lacrima",
    note: "took a week to stop thinking about the dance floor.",
    watchedOn: "2026-02-02",
  },
  {
    id: "example-chungking-express",
    title: "Chungking Express",
    director: "Wong Kar-wai",
    year: 1994,
    country: "Hong Kong",
    rating: 4,
    cluster: "solitudo",
    watchedOn: "2026-02-20",
  },
  {
    id: "example-columbus",
    title: "Columbus",
    director: "Kogonada",
    year: 2017,
    country: "United States",
    rating: 4,
    cluster: "solitudo",
    watchedOn: "2026-03-08",
  },
  {
    id: "example-perfect-days",
    title: "Perfect Days",
    director: "Wim Wenders",
    year: 2023,
    country: "Japan",
    rating: 5,
    cluster: "domus",
    rewatches: [{ year: 2026, rating: 5, date: "2026-04-01" }],
    watchedOn: "2026-03-15",
  },
];
