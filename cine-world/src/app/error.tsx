"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown while rendering any page under the root layout — e.g. a transient
 * network blip calling Supabase right after the OAuth redirect, which previously fell through
 * to the platform's raw error interstitial with no way back in except typing the URL again.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-[440px] flex-col items-center justify-center gap-4 px-7 py-16 text-center">
      <p className="text-[13px] font-semibold tracking-[0.14em] text-accent-strong uppercase">Love for Cinema</p>
      <h1 className="text-[20px] font-semibold text-ink">Something went wrong</h1>
      <p className="text-[13.5px] leading-[1.7] text-ink-soft">
        That was likely a brief hiccup, not lost data. Try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white"
      >
        Try again
      </button>
    </main>
  );
}
