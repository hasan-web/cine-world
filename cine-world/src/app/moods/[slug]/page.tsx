import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Reveal } from "@/components/motion/Reveal";
import { getCatalogFilmsByCluster } from "@/data/catalog";
import { CLUSTERS } from "@/data/clusters";
import type { ClusterId } from "@/lib/types";

export const dynamicParams = false;

interface MoodPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CLUSTERS.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: MoodPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cluster = CLUSTERS.find((c) => c.id === slug);
  if (!cluster) return {};

  const title = `${cluster.label} Movies: ${cluster.mood[0].toUpperCase()}${cluster.mood.slice(1)}`;

  return {
    title,
    description: cluster.description,
    alternates: { canonical: `/moods/${slug}` },
    openGraph: {
      title: `${title} | Love for Cinema`,
      description: cluster.description,
      url: `https://loveforcinema.com/moods/${slug}`,
      type: "website",
    },
    twitter: { card: "summary", title, description: cluster.description },
  };
}

export default async function MoodPage({ params }: MoodPageProps) {
  const { slug } = await params;
  const cluster = CLUSTERS.find((c) => c.id === slug);
  if (!cluster) notFound();

  const films = getCatalogFilmsByCluster(cluster.id as ClusterId);
  const otherMoods = CLUSTERS.filter((c) => c.id !== cluster.id);

  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-[820px] px-6 pb-16 sm:px-10 sm:pb-20">
        <p className="mb-8 pt-8 text-[11px] tracking-[0.08em] text-ink-faint uppercase">
          <Link href="/moods" className="text-accent hover:underline">
            Moods
          </Link>{" "}
          / {cluster.label}
        </p>

        <Reveal>
          <p className="mb-2 text-[11px] tracking-[0.2em] text-accent uppercase">A Love for Cinema mood</p>
          <h1 className="mb-3 text-[28px] font-semibold text-ink">{cluster.label} Movies</h1>
          <p className="mb-10 max-w-[62ch] text-[14.5px] leading-[1.8] text-ink-soft">{cluster.description}</p>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {films.map((film, i) => (
            <Reveal key={film.slug} delay={i * 60}>
              <Link
                href={`/movies/${film.slug}`}
                className="glass flex flex-col gap-1 px-5 py-4 transition-transform hover:-translate-y-0.5"
              >
                <span className="text-[14.5px] font-medium text-ink">{film.title}</span>
                <span className="text-[11.5px] text-ink-faint">
                  {film.director} · {film.year}
                </span>
                <span className="text-[11.5px] text-accent-strong capitalize">{film.themes.join(" · ")}</span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={films.length * 60 + 60}>
          <div className="mt-10 border-t border-line pt-8">
            <p className="mb-3 text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">Other moods</p>
            <div className="flex flex-wrap gap-3">
              {otherMoods.map((m) => (
                <Link
                  key={m.id}
                  href={`/moods/${m.id}`}
                  className="rounded-full border border-line-strong px-4 py-2 text-[12px] text-ink-soft hover:border-accent/50"
                >
                  {m.label} — {m.mood}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </main>
      <div className="px-4 pb-4 sm:px-6">
        <LandingFooter />
      </div>
    </>
  );
}
