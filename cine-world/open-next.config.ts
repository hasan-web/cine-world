import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// Without an incremental cache binding, SSG pages (movies/moods/movies-like — anything using
// generateStaticParams) build correctly but 404 in production: the Worker has nowhere to read the
// prerendered HTML from. KV is used here rather than the R2 backend OpenNext recommends because R2
// isn't enabled on this Cloudflare account yet (a one-time manual step in the dashboard) — migrate
// to r2-incremental-cache once it is, since KV's eventual consistency means a page can briefly
// serve stale content right after a deploy.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
