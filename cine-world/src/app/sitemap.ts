import type { MetadataRoute } from "next";

// Only the truly public routes belong here — /collection, /friends, /log, and
// /film/[id] all redirect to /login when signed out, so listing them would
// just send crawlers into a redirect loop with nothing to index.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://loveforcinema.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://loveforcinema.com/manifesto",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://loveforcinema.com/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
