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
    <main className="mx-auto flex min-h-screen max-w-[440px] items-center px-7 py-16">
      <div className="glass w-full px-8 py-10">
        <h1 className="mb-1 text-[13px] font-semibold tracking-[0.14em] text-accent-strong uppercase">Constellation</h1>
        <p className="mb-4 text-[16px] text-ink-soft">a keepsake program for what you&rsquo;ve watched</p>
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
              className="mb-6 w-full rounded-2xl border border-line-strong px-6 py-3 text-[12.5px] font-semibold text-ink"
            >
              Continue with Google
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <p className="mb-4 text-[13.5px] leading-[1.7] text-ink-soft">
              Enter your email and we&rsquo;ll send a link in, no password to remember.
            </p>

            <form action={action}>
              <label className="mb-4 flex items-baseline gap-2.5">
                <span className="w-14 flex-none text-[11px] tracking-[0.06em] text-ink-faint uppercase">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="flex-1 border-b border-line bg-transparent pb-1.5 text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
                />
              </label>
              {state.status === "error" && <p className="mb-4 text-[12.5px] text-accent-strong">{state.message}</p>}
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50"
              >
                {pending ? "sending…" : "send a link in →"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
