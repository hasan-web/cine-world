"use server";

import { getOptionalUser } from "@/lib/dal";
import { getCinemaInsights, type CinemaInsights } from "@/lib/cinemaInsights";
import { listFilms } from "@/lib/films";

/** A personality read off a handful of films would overclaim, so it waits for the same "not
 * enough yet" floor used elsewhere in the app before generating one. */
const MIN_FILMS_FOR_PERSONALITY = 4;

/**
 * /movies stays a static, cookie-free Server Component (see PublicPageShell) so it keeps working
 * for signed-out visitors and stays cheap to serve. This is called from a client component instead
 * of the page itself, exactly like PublicPageShell's own auth check — getOptionalUser() never
 * redirects, so a signed-out visitor or a too-new collection both just get null back.
 */
export async function fetchCinemaPersonality(): Promise<CinemaInsights | null> {
  const user = await getOptionalUser();
  if (!user) return null;

  const films = await listFilms();
  if (films.length < MIN_FILMS_FOR_PERSONALITY) return null;

  return getCinemaInsights(films);
}
