"use client";

import { useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signInWithEmail, type SignInState } from "./actions";

const initialState: SignInState = { status: "idle" };

async function signInWithGoogle() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/confirm` },
  });
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(signInWithEmail, initialState);

  return (
    <main className="mx-auto max-w-[420px] px-7 py-24">
      <h1 className="mb-1 font-display text-[13px] tracking-[0.14em] text-oxblood uppercase">Constellation</h1>
      <p className="mb-4 font-body text-[16px] italic text-ink-soft">a keepsake program for what you&rsquo;ve watched</p>
      <p className="mb-8 max-w-[38ch] text-[13.5px] leading-[1.7] text-ink-soft">
        Every film you log becomes a specimen pressed into your own collection — placed by how it felt, not
        its genre, and brightened by how much it mattered.
      </p>

      {state.status === "sent" ? (
        <p className="text-[14px] leading-[1.7] text-ink-soft">{state.message}</p>
      ) : (
        <>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mb-6 w-full border border-brass px-6 py-3 font-display text-[11px] tracking-[0.14em] text-oxblood uppercase"
          >
            Continue with Google
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <p className="mb-4 text-[13.5px] leading-[1.7] text-ink-soft">
            Enter your email and we&rsquo;ll send a link in, no password to remember.
          </p>

          <form action={action} className="border border-line bg-paper-deep p-6">
            <label className="mb-4 flex items-baseline gap-2.5">
              <span className="w-14 flex-none font-mono text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 border-b border-line bg-transparent pb-1.5 font-mono text-[13px] text-ink outline-none placeholder:text-ink-soft/60"
              />
            </label>
            {state.status === "error" && <p className="mb-4 text-[12.5px] text-oxblood">{state.message}</p>}
            <button
              type="submit"
              disabled={pending}
              className="font-mono text-[10.5px] tracking-[0.08em] text-oxblood uppercase underline decoration-oxblood/50 underline-offset-4 disabled:opacity-50"
            >
              {pending ? "sending…" : "send a link in →"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
