import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StarMark } from "@/components/atlas/StarMark";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/motion/Reveal";
import { PublicPageShell } from "@/components/shell/PublicPageShell";
import { CATALOG, getCatalogFilm, getMoreFromDirector, getRelatedFilms, hasMoviesLikePage } from "@/data/catalog";
import { CLUSTERS } from "@/data/clusters";
import { getPublicFilmStats } from "@/lib/films";

export const dynamicParams = false;
// Real usage numbers below can only grow over time, so the static page is worth regenerating
// periodically rather than only at build time — once a day is plenty for a stat that changes
// this slowly, and keeps this from ever hitting the database on a live request.
export const revalidate = 86400;

interface MoviePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATALOG.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  const film = getCatalogFilm(slug);
  if (!film) return {};

  const title = `${film.title} (${film.year}) — Movie`;

  return {
    title,
    description: film.overview,
    alternates: { canonical: `/movies/${slug}` },
    openGraph: {
      title: `${title} | Love for Cinema`,
      description: film.overview,
      url: `https://loveforcinema.com/movies/${slug}`,
      type: "article",
    },
    twitter: { card: "summary", title, description: film.overview },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { slug } = await params;
  const film = getCatalogFilm(slug);
  if (!film) notFound();

  const cluster = CLUSTERS.find((c) => c.id === film.cluster)!;
  const related = getRelatedFilms(slug);
  const moreFromDirector = getMoreFromDirector(slug);
  const likePage = hasMoviesLikePage(slug);
  const stats = await getPublicFilmStats(film.slug);
  const topCluster = stats?.topCluster ? CLUSTERS.find((c) => c.id === stats.topCluster) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: film.title,
    description: film.overview,
    dateCreated: String(film.year),
    director: { "@type": "Person", name: film.director },
    countryOfOrigin: film.country,
  };

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[820px] px-6 pb-16 sm:px-10 sm:pb-20">
        <p className="mb-8 pt-8 text-[11px] tracking-[0.08em] text-ink-faint uppercase">
          <Link href="/movies" className="text-accent hover:underline">
            Movies
          </Link>{" "}
          / {film.title}
        </p>

        <Reveal>
          <div className="glass flex flex-wrap gap-7 px-6 py-7 sm:px-8 sm:py-8">
            <StarMark cluster={cluster} seed={film.slug} size={140} />
            <div className="min-w-[240px] flex-1">
              <h1 className="mb-1.5 text-[26px] font-semibold text-ink">{film.title}</h1>
              <p className="mb-4 text-[12px] tracking-[0.04em] text-ink-faint uppercase">
                {film.director} · {film.year} · {film.country}
              </p>
              <p className="mb-5 max-w-[52ch] text-[14.5px] leading-[1.8] text-ink-soft">{film.overview}</p>

              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Link
                  href={`/moods/${cluster.id}`}
                  className="rounded-full border border-line-strong px-3 py-1 text-[11.5px] font-medium text-accent-strong hover:border-accent/50"
                >
                  {cluster.label} · {cluster.mood}
                </Link>
                {film.themes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full bg-glass-edge px-3 py-1 text-[11.5px] text-ink-soft capitalize"
                  >
                    {theme}
                  </span>
                ))}
              </div>

              {stats && (
                <p className="mb-5 text-[12.5px] text-ink-faint">
                  <span className="font-semibold text-ink-soft">
                    {stats.logCount} {stats.logCount === 1 ? "person has" : "people have"}
                  </span>{" "}
                  logged this on Love for Cinema
                  {topCluster && (
                    <>
                      , most under <span className="text-accent-strong">{topCluster.label}</span>
                    </>
                  )}
                  {stats.rewatchCount > 0 && (
                    <> · {stats.rewatchCount} rewatch{stats.rewatchCount === 1 ? "" : "es"} logged</>
                  )}
                  .
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {likePage && (
                  <Link
                    href={`/movies-like/${slug}`}
                    className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-5 py-2 text-[12px] font-semibold text-white"
                  >
                    Movies like {film.title} →
                  </Link>
                )}
                <Link
                  href={{
                    pathname: "/log",
                    query: { title: film.title, director: film.director, year: film.year, country: film.country },
                  }}
                  className="inline-flex items-center rounded-full border border-line-strong px-5 py-2 text-[12px] font-semibold text-ink"
                >
                  Log this film
                </Link>
              </div>

              {moreFromDirector.length > 0 && (
                <p className="mt-5 text-[12.5px] text-ink-faint">
                  More from {film.director}:{" "}
                  {moreFromDirector.map((f, i) => (
                    <span key={f.slug}>
                      {i > 0 && ", "}
                      <Link href={`/movies/${f.slug}`} className="text-accent hover:underline">
                        {f.title}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        {related.length > 0 && (
          <Reveal delay={90}>
            <section className="mt-10">
              <h2 className="mb-4 text-[15px] font-semibold text-ink">Related films</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map(({ film: rel, sharedThemes }) => {
                  const relCluster = CLUSTERS.find((c) => c.id === rel.cluster)!;
                  return (
                    <Link
                      key={rel.slug}
                      href={`/movies/${rel.slug}`}
                      className="glass flex items-center gap-4 px-5 py-4 transition-transform hover:-translate-y-0.5"
                    >
                      <StarMark cluster={relCluster} seed={rel.slug} size={56} />
                      <span className="flex flex-col gap-1">
                        <span className="text-[14.5px] font-medium text-ink">{rel.title}</span>
                        <span className="text-[11.5px] text-ink-faint">
                          {rel.director} · {rel.year}
                        </span>
                        <span className="text-[11.5px] text-accent-strong capitalize">
                          {sharedThemes.join(" · ")}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </Reveal>
        )}
      </div>
      <div className="px-4 pb-4 sm:px-6">
        <LandingFooter />
      </div>
    </PublicPageShell>
  );
}
