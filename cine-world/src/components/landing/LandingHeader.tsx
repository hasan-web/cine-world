import Link from "next/link";
import { HeaderAuthAction } from "@/components/landing/HeaderAuthAction";

/**
 * Shared across every public page (landing, manifesto, movies, moods) — including ones a signed-in
 * visitor reaches directly, like clicking "Discover" in their own sidebar nav. Deliberately stays a
 * plain, cookie-free Server Component: the sign-in/sign-out button is the only piece that needs to
 * know about the session, and that lives in HeaderAuthAction specifically so checking it doesn't
 * force every page this header sits on to render dynamically — see that file for why.
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6">
      <div className="glass mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3 sm:px-7">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[14px] font-semibold text-accent-strong">Love for Cinema</span>
        </Link>
        <nav className="flex items-center gap-5">
          {/* First on purpose: it's the only nav item a first-time visitor can act on without an
              account, so it shouldn't sit behind the reference sections. */}
          <Link href="/where-it-sits" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
            Play
          </Link>
          <Link href="/movies" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
            Movies
          </Link>
          <Link href="/moods" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
            Moods
          </Link>
          <Link href="/manifesto" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
            Manifesto
          </Link>
          <HeaderAuthAction />
        </nav>
      </div>
    </header>
  );
}
