import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * A cookie-free Supabase client for public, anonymous reads inside statically-generated pages.
 *
 * `src/lib/supabase/server.ts`'s client calls `cookies()` internally (it needs to, for session
 * refresh), and touching that Next.js dynamic API inside a Server Component forces the whole route
 * to render per-request instead of as a static/ISR page — even for data that has nothing to do with
 * the visitor's own session. The public movie pages don't need a session for this read at all, so
 * this client skips cookies entirely and lets those pages stay static.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
