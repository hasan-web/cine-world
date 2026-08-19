import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { PublicPageShell } from "@/components/shell/PublicPageShell";
import { CATALOG, getCatalogFilm, getRelatedFilms, hasMoviesLikePage } from "@/data/catalog";
import { CLUSTERS } from "@/data/clusters";

export const dynamicParams = false;

interface MoviesLikePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATALOG.filter((f) => hasMoviesLikePage(f.slug)).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: MoviesLikePageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = getCatalogFilm(slug);
  if (!film || !hasMoviesLikePage(slug)) return {};

  const title = `Movies Like ${film.title}: Films You'll Love`;
  const description = film.likeIntro ?? `Real recommendations for fans of ${film.title}.`;

  return {
    title,
    description,
    alternates: { canonical: `/movies-like/${slug}` },
    openGraph: {
      title: `${title} | Love for Cinema`,
      description,
      url: `https://loveforcinema.com/movies-like/${slug}`,
      type: "article",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function MoviesLikePage({ params }: MoviesLikePageProps) {
  const { slug } = await params;
  const film = getCatalogFilm(slug);
  if (!film || !hasMoviesLikePage(slug)) notFound();

  const related = getRelatedFilms(slug);
  const cluster = CLUSTERS.find((c) => c.id === film.cluster)!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Movies like ${film.title}`,
    itemListElement: related.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://loveforcinema.com/movies/${r.film.slug}`,
      name: r.film.title,
    })),
  };

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[820px] px-6 pb-16 sm:px-10 sm:pb-20">
        <p className="mb-8 pt-8 text-[11px] tracking-[0.08em] text-ink-faint uppercase">
          <Link href="/movies" className="text-accent hover:underline">
            Movies
          </Link>{" "}
          /{" "}
          <Link href={`/movies/${slug}`} className="text-accent hover:underline">
            {film.title}
          </Link>{" "}
          / Movies like this
        </p>

        <Reveal>
          <h1 className="mb-3 max-w-[24ch] text-[28px] font-semibold text-ink">Movies Like {film.title}</h1>
          <p className="mb-10 max-w-[62ch] text-[14.5px] leading-[1.8] text-ink-soft">{film.likeIntro}</p>
        </Reveal>

        <div className="flex flex-col gap-3">
          {related.map(({ film: rel, sharedThemes }, i) => (
            <Reveal key={rel.slug} delay={i * 60}>
              <Link
                href={`/movies/${rel.slug}`}
                className="glass flex flex-wrap items-center justify-between gap-3 px-6 py-5 transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-[16px] font-medium text-ink">{rel.title}</p>
                  <p className="text-[12px] text-ink-faint">
                    {rel.director} · {rel.year}
                  </p>
                </div>
                <p className="text-[12.5px] font-medium text-accent-strong capitalize">
                  {sharedThemes.join(" · ")}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={related.length * 60 + 60}>
          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-8">
            <Link
              href={`/movies/${slug}`}
              className="text-[12.5px] text-ink-soft underline decoration-line-strong underline-offset-4"
            >
              ← Back to {film.title}
            </Link>
            <Link
              href={`/moods/${cluster.id}`}
              className="text-[12.5px] text-ink-soft underline decoration-line-strong underline-offset-4"
            >
              More {cluster.label} films →
            </Link>
          </div>
        </Reveal>
      </div>
    </PublicPageShell>
  );
}
