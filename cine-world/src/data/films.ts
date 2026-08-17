import type { PlacedFilm } from "@/lib/types";

export const FILMS: PlacedFilm[] = [
  {
    id: "chungking-express",
    title: "Chungking Express",
    director: "Wong Kar-wai",
    year: 1994,
    country: "Hong Kong",
    rating: 4,
    cluster: "solitudo",
    note:
      "Rewatched three times since 2019, and it lands differently each visit — softer now, less about the pineapple, more about the apartment.",
    rewatches: [
      { year: 2019, rating: 3 },
      { year: 2022, rating: 4 },
      { year: 2025, rating: 4 },
    ],
  },
  { id: "in-the-mood-for-love", title: "In the Mood for Love", director: "Wong Kar-wai", year: 2000, country: "Hong Kong", rating: 5, cluster: "lacrima" },
  { id: "paris-texas", title: "Paris, Texas", director: "Wim Wenders", year: 1984, country: "West Germany", rating: 5, cluster: "solitudo" },
  { id: "aftersun", title: "Aftersun", director: "Charlotte Wells", year: 2022, country: "United Kingdom", rating: 5, cluster: "lacrima" },
  { id: "perfect-days", title: "Perfect Days", director: "Wim Wenders", year: 2023, country: "Japan", rating: 4, cluster: "domus" },
  { id: "portrait-of-a-lady-on-fire", title: "Portrait of a Lady on Fire", director: "Céline Sciamma", year: 2019, country: "France", rating: 5, cluster: "lacrima" },
  { id: "columbus", title: "Columbus", director: "Kogonada", year: 2017, country: "United States", rating: 4, cluster: "solitudo" },
  { id: "drive-my-car", title: "Drive My Car", director: "Ryusuke Hamaguchi", year: 2021, country: "Japan", rating: 5, cluster: "solitudo" },
  { id: "past-lives", title: "Past Lives", director: "Celine Song", year: 2023, country: "United States", rating: 4, cluster: "lacrima" },
  { id: "blue-valentine", title: "Blue Valentine", director: "Derek Cianfrance", year: 2010, country: "United States", rating: 4, cluster: "lacrima" },
  { id: "eternal-sunshine", title: "Eternal Sunshine of the Spotless Mind", director: "Michel Gondry", year: 2004, country: "United States", rating: 5, cluster: "amplitudo" },
  { id: "before-sunset", title: "Before Sunset", director: "Richard Linklater", year: 2004, country: "United States", rating: 5, cluster: "domus" },
  { id: "amelie", title: "Amélie", director: "Jean-Pierre Jeunet", year: 2001, country: "France", rating: 4, cluster: "domus" },
  { id: "ratatouille", title: "Ratatouille", director: "Brad Bird", year: 2007, country: "United States", rating: 4, cluster: "domus" },
  { id: "lost-in-translation", title: "Lost in Translation", director: "Sofia Coppola", year: 2003, country: "United States", rating: 4, cluster: "solitudo" },
  { id: "worst-person-in-the-world", title: "The Worst Person in the World", director: "Joachim Trier", year: 2021, country: "Norway", rating: 5, cluster: "amplitudo" },
  { id: "moonlight", title: "Moonlight", director: "Barry Jenkins", year: 2016, country: "United States", rating: 5, cluster: "lacrima" },
  { id: "her", title: "Her", director: "Spike Jonze", year: 2013, country: "United States", rating: 4, cluster: "solitudo" },
  { id: "burning", title: "Burning", director: "Lee Chang-dong", year: 2018, country: "South Korea", rating: 4, cluster: "amplitudo" },
  { id: "shoplifters", title: "Shoplifters", director: "Hirokazu Kore-eda", year: 2018, country: "Japan", rating: 5, cluster: "domus" },
];
