# Constellation

A mood-based film diary, built for [Love for Cinema](https://loveforcinema.com). No star-out-of-five average, no poster grid — every film you log is placed in one of four moods (*Solitudo*, *Amplitudo*, *Domus*, *Lacrima*), and where it lands is a choice, not a category a catalogue assigned it. A rewatch adds to that film's record instead of overwriting your first verdict, and comparing taste with a friend means overlaying two skies to see where you actually agree — not a percentage an algorithm invented.

## Stack

- **Next.js 16** (App Router, Turbopack) — this version has real breaking changes from what you may know; read `node_modules/next/dist/docs/` before assuming an API
- **React 19**, TypeScript, Tailwind CSS v4
- **Supabase** — Postgres, Auth, Row Level Security
- **Cloudflare Workers**, deployed via OpenNext
- **TMDB** for film search and metadata
- **Resend** for email

## Getting started

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
TMDB_API_KEY=
RESEND_API_KEY=
```

Run the schema in `supabase/schema.sql` against your Supabase project — it's idempotent and safe to re-run as it's grown incrementally. Then:

```bash
npm run dev
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run preview` | Build and preview the Cloudflare Worker locally |
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` from `wrangler.jsonc` |

## What's here

- **Logging** — search TMDB, place a film in a mood, rate it, watch it become a star in your sky
- **Rewatches** — each one is its own record (date, mood, note), not an overwrite of the original
- **Collection dashboard** (`/collection`) — the sky itself, a mood breakdown, top directors, a diary preview
- **Diary** (`/diary`) — every viewing as its own dated entry, rewatches included, newest first
- **Stats** (`/stats`) — rating distribution, activity over the last 12 months, mood split, decades, most-rewatched
- **Friends** (`/friends`) — mutual-consent requests (not a one-way follow) and a Taste Twins overlay showing where two collections actually coincide
- **Import from Letterboxd** (`/import`) — bring in `ratings.csv`, `diary.csv`, or `watched.csv`; imported films land unplaced and wait in a queue (`/place`) until you give them a mood, since an export can't say how something felt
- **Manifesto** (`/manifesto`) — the reasoning behind the mood-based approach

## Project structure

```
src/
  app/            routes (App Router) — one folder per page, actions.ts for server actions
  components/     UI, grouped by the page or feature that owns it
  lib/            data access (films.ts, friends.ts), parsing (letterboxd.ts), and pure logic
                  (diary.ts, stats.ts, starfield.ts)
  data/           static content — the four mood clusters, sample films for the landing page
supabase/
  schema.sql      the whole schema, additive migrations included inline with their reasoning
```

## Design notes worth knowing before changing things

- **Friends are mutual-consent on purpose.** A one-way follow was considered and rejected — seeing someone's full collection is intimate enough that both sides should have agreed to it.
- **A rewatch never overwrites.** `createFilm` uses `.insert()`, not `.upsert()`; a unique-violation means the film already exists, and the caller routes to `addRewatch` instead.
- **Imported films start with `cluster = null`** and are deliberately excluded from the sky and from stats until placed — see the migration comment in `schema.sql` for why guessing a mood was rejected.
- **Storage is capped on import**, since a bulk import is the one action a single account could take that meaningfully costs the database: 10,000 films per user, 5,000 rows per import, deterministic film IDs (`slug-year`) so re-importing the same file is a no-op rather than a duplicate.
- Real dark mode support — `prefers-color-scheme` drives CSS custom properties, and canvas-drawn elements (the sky, the overlap view) resolve their colors from those properties at paint time rather than hardcoding them.
