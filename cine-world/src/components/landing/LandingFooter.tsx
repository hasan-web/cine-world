import Link from "next/link";
import { FooterAuthLink } from "@/components/landing/FooterAuthLink";
import { CLUSTERS } from "@/data/clusters";

export function LandingFooter() {
  return (
    <div className="glass mx-auto grid max-w-[1100px] gap-8 px-7 py-10 sm:grid-cols-[1.3fr_1fr_1fr] sm:px-10">
      <div>
        <p className="mb-2 text-[11px] tracking-[0.2em] text-accent uppercase">Love for Cinema</p>
        <p className="mb-4 text-[16px] font-semibold text-ink">a mood-based film diary</p>
        <p className="max-w-[38ch] text-[13px] leading-[1.7] text-ink-soft">
          A film diary for people who suspected the rating was never really the point.
        </p>
      </div>
      <div>
        <p className="mb-3 text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">Explore</p>
        <ul className="flex flex-col gap-2 text-[13px]">
          <li>
            <Link href="/movies" className="text-ink-soft hover:text-ink">
              Movies
            </Link>
          </li>
          <li>
            <Link href="/moods" className="text-ink-soft hover:text-ink">
              Moods
            </Link>
          </li>
          <li>
            <Link href="/manifesto" className="text-ink-soft hover:text-ink">
              Why we built it this way
            </Link>
          </li>
          <li>
            <FooterAuthLink />
          </li>
        </ul>
      </div>
      <div>
        <p className="mb-3 text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">The four moods</p>
        <ul className="flex flex-col gap-2 text-[13px] text-ink-soft">
          {CLUSTERS.map((c) => (
            <li key={c.id}>
              <span className="text-ink">{c.label}</span> — {c.mood}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
