"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/client";

/**
 * The one part of LandingHeader that actually needs to know about the session — split out into
 * its own client component specifically so checking it doesn't happen on the server. A Server
 * Component version of this (reading cookies to check auth) sounds more correct, but every public
 * page LandingHeader sits on — /movies, /moods, /manifesto, all the SEO pages — shares this one
 * header, so a server-side cookie read here forced literally all of them to render dynamically on
 * every request instead of staying static/ISR. That's a worse trade than a brief flash: most
 * visitors to these pages are signed out anyway, so defaulting to "Sign in" and swapping to
 * "Sign out" once the client confirms a session is the fast path, not the exception.
 */
export function HeaderAuthAction() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-4 py-2 text-[12px] font-semibold text-white"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/collection" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
        Your sky
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full border border-line-strong px-4 py-2 text-[12px] font-semibold text-ink-soft hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
