"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * The footer's own version of HeaderAuthAction's problem: LandingFooter sits on every public page
 * and has to stay a static Server Component for the same reason (see that file) — so its one
 * session-dependent link needs the same client-side split, or it always shows "Sign in" even to a
 * signed-in visitor scrolled down to the footer.
 */
export function FooterAuthLink() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  if (signedIn) {
    return (
      <Link href="/collection" className="text-ink-soft hover:text-ink">
        Your sky
      </Link>
    );
  }

  return (
    <Link href="/login" className="text-ink-soft hover:text-ink">
      Sign in
    </Link>
  );
}
