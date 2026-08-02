import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * The authoritative session check — unlike proxy's getClaims() (a fast local JWT
 * check), getUser() confirms with the Auth server that the session hasn't been
 * revoked. Cached per request so calling this from several components/actions
 * in one render doesn't cost multiple round trips.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});

/** Same check as verifySession(), but for public pages that render either way — never redirects. */
export const getOptionalUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
