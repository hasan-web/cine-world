import type { Metadata } from "next";
import Link from "next/link";
import { DiscoverPersonalityCard } from "@/components/movies/DiscoverPersonalityCard";
import { Reveal } from "@/components/motion/Reveal";
import { PublicPageShell } from "@/components/shell/PublicPageShell";
import { CATALOG } from "@/data/catalog";
import { CLUSTERS } from "@/data/clusters";

export const metadata: Metadata = {
  title: "Movies",
  description:
    "A small, hand-picked collection of films worth logging — browse by mood, or follow a film to what's similar.",
  alternates: { canonical: "/movies" },
};

export default function MoviesIndexPage() {
  return (
    <PublicPageShell>
      <div className="mx-auto max-w-[820px] px-6 pb-16 sm:px-10 sm:pb-20">
        <Reveal>
          <p className="mb-2 pt-8 text-[11px] tracking-[0.2em] text-accent uppercase">Browse</p>
          <h1 className="mb-3 text-[28px] font-semibold text-ink">Movies</h1>
          <p className="mb-6 max-w-[62ch] text-[14.5px] leading-[1.8] text-ink-soft">
            A small, hand-picked set of films — not a database dump. Each one links to what it&rsquo;s similar to
            and which of the four moods it sits in.
          </p>
        </Reveal>

        <DiscoverPersonalityCard />

        <Reveal>
          <div className="mb-10 flex flex-wrap gap-2">
            {CLUSTERS.map((c) => (
              <Link
                key={c.id}
                href={`/moods/${c.id}`}
                className="rounded-full border border-line-strong px-3.5 py-1.5 text-[12px] text-ink-soft hover:border-accent/50"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {CATALOG.map((film, i) => (
            <Reveal key={film.slug} delay={(i % 6) * 50}>
              <Link
                href={`/movies/${film.slug}`}
                className="glass flex flex-col gap-1 px-5 py-4 transition-transform hover:-translate-y-0.5"
              >
                <span className="text-[14.5px] font-medium text-ink">{film.title}</span>
                <span className="text-[11.5px] text-ink-faint">
                  {film.director} · {film.year}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </PublicPageShell>
  );
}
