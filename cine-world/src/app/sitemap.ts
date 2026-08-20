import type { MetadataRoute } from "next";
import { CATALOG, hasMoviesLikePage } from "@/data/catalog";
import { CLUSTERS } from "@/data/clusters";

const SITE_URL = "https://loveforcinema.com";

// Only the truly public routes belong here — /collection, /friends, /log, and
// /film/[id] all redirect to /login when signed out, so listing them would
// just send crawlers into a redirect loop with nothing to index.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/manifesto`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/where-it-sits`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/movies`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/moods`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const movieRoutes: MetadataRoute.Sitemap = CATALOG.map((film) => ({
    url: `${SITE_URL}/movies/${film.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const moviesLikeRoutes: MetadataRoute.Sitemap = CATALOG.filter((f) => hasMoviesLikePage(f.slug)).map((film) => ({
    url: `${SITE_URL}/movies-like/${film.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const moodRoutes: MetadataRoute.Sitemap = CLUSTERS.map((cluster) => ({
    url: `${SITE_URL}/moods/${cluster.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...movieRoutes, ...moviesLikeRoutes, ...moodRoutes];
}
