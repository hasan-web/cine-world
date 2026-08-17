import Link from "next/link";
import { CLUSTERS } from "@/data/clusters";

export function LandingFooter() {
  return (
    <div className="glass mx-auto grid max-w-[1100px] gap-8 px-7 py-10 sm:grid-cols-[1.3fr_1fr_1fr] sm:px-10">
      <div>
        <p className="mb-2 text-[11px] tracking-[0.2em] text-accent uppercase">Love for Cinema</p>
        <p className="mb-4 text-[16px] font-semibold text-ink">Constellation</p>
        <p className="max-w-[38ch] text-[13px] leading-[1.7] text-ink-soft">
          A keepsake program for what you&rsquo;ve watched — logged by feeling, not filed by genre.
        </p>
      </div>
      <div>
        <p className="mb-3 text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">Explore</p>
        <ul className="flex flex-col gap-2 text-[13px]">
          <li>
            <Link href="/manifesto" className="text-ink-soft hover:text-ink">
              Why we built it this way
            </Link>
          </li>
          <li>
            <Link href="/login" className="text-ink-soft hover:text-ink">
              Sign in
            </Link>
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
