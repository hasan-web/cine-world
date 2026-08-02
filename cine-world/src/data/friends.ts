import type { Film } from "@/lib/types";
import { FILMS } from "@/data/films";

export interface Friend {
  id: string;
  name: string;
  /** ids shared with FILMS render as coincident stars. */
  filmIds: string[];
}

const sharedWithMei = FILMS.filter((f) =>
  ["chungking-express", "in-the-mood-for-love", "aftersun", "drive-my-car", "past-lives", "moonlight", "shoplifters"].includes(f.id),
).map((f) => f.id);

const meiOnlyFilms: Film[] = [
  { id: "cleo-from-5-to-7", title: "Cléo from 5 to 7", director: "Agnès Varda", year: 1962, country: "France", rating: 4, cluster: "solitudo" },
  { id: "the-handmaiden", title: "The Handmaiden", director: "Park Chan-wook", year: 2016, country: "South Korea", rating: 5, cluster: "amplitudo" },
  { id: "weekend", title: "Weekend", director: "Andrew Haigh", year: 2011, country: "United Kingdom", rating: 4, cluster: "lacrima" },
  { id: "call-me-by-your-name", title: "Call Me by Your Name", director: "Luca Guadagnino", year: 2017, country: "Italy", rating: 4, cluster: "lacrima" },
  { id: "certain-women", title: "Certain Women", director: "Kelly Reichardt", year: 2016, country: "United States", rating: 4, cluster: "domus" },
];

export const MEI: Friend = {
  id: "mei",
  name: "Mei",
  filmIds: [...sharedWithMei, ...meiOnlyFilms.map((f) => f.id)],
};

export const MEI_FILMS: Film[] = [...FILMS.filter((f) => sharedWithMei.includes(f.id)), ...meiOnlyFilms];
