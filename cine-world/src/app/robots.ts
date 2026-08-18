import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Belt-and-suspenders alongside middleware.ts, which already redirects signed-out
      // requests to these paths to /login — nothing under them is ever indexable content.
      disallow: ["/api/", "/collection", "/diary", "/stats", "/friends", "/import", "/log", "/place"],
    },
    sitemap: "https://loveforcinema.com/sitemap.xml",
  };
}
