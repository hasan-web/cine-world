import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6">
      <div className="glass mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3 sm:px-7">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[14px] font-semibold text-accent-strong">Love for Cinema</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/movies" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
            Movies
          </Link>
          <Link href="/moods" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
            Moods
          </Link>
          <Link href="/manifesto" className="hidden text-[12.5px] text-ink-soft hover:text-ink sm:inline">
            Manifesto
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-4 py-2 text-[12px] font-semibold text-white"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
