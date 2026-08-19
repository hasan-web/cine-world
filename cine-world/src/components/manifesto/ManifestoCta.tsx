"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * "Start your own sky" only makes sense as a pitch to someone who doesn't have one yet — a
 * signed-in visitor reading the manifesto already does. Same client-side auth check as
 * FooterAuthLink/HeaderAuthAction, so the manifesto's prose can stay a static Server Component.
 */
export function ManifestoCta() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  if (signedIn) return null;

  return (
    <div className="mt-10 border-t border-line pt-8 text-center">
      <Link
        href="/login"
        className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-7 py-3 text-[12.5px] font-semibold text-white"
      >
        Sign in and start your own sky →
      </Link>
    </div>
  );
}
