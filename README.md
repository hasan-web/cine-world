<p align="center">
  <img src="docs/hero.svg" alt="Constellation — Love for Cinema: a keepsake program for what you've watched" width="100%" />
</p>

<h1 align="center">Constellation</h1>
<p align="center"><em>a keepsake program for what you've watched, by <a href="https://loveforcinema.com">Love for Cinema</a></em></p>

<p align="center">
  <a href="https://loveforcinema.com"><strong>loveforcinema.com →</strong></a>
</p>

---

Constellation is a film-logging app built as an alternative to the poster-grid, star-out-of-five format most letterboxd-style trackers default to. Every film you log is pressed into your own collection like a specimen in a naturalist's field book — its **position** set by how it felt, not its genre, and its **brightness** by how much it mattered.

No feed. No algorithmic recommendations. No public follower count. Just your own sky, and the people you've actually chosen to compare it with.

## What makes it different

**Mood, not genre**
Each film goes into one of four moods — *Solitudo* (the quiet, tense ones), *Amplitudo* (the epics), *Domus* (comfort watches), *Lacrima* (what wrecked you) — chosen by you, not assigned by a catalogue.

**Rewatches don't overwrite**
Watching something again adds a new point to that film's own timeline instead of replacing your first verdict, so how your reading of a film moved over the years stays visible.

**Taste twins, made visible**
Send a friend request, and once it's mutually accepted, overlay their collection over yours. A film that lands in *exactly* the same place for both of you glows — that's the overlap. Not a percentage on a profile page, an actual shared coordinate.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Server Actions) + TypeScript
- **[Tailwind CSS v4](https://tailwindcss.com)** — CSS-first theme tokens, no config file
- **[Supabase](https://supabase.com)** — Postgres, Auth (magic link + Google OAuth), Row Level Security
- **[Resend](https://resend.com)** — transactional email, styled to match the app itself
- **[TMDB](https://www.themoviedb.org)** — film search and metadata
- Canvas-based rendering for every "sky" — no charting library, just `<canvas>` and some trigonometry
- Deployed on **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)

## Running it locally

The app lives in the `cine-world/` subfolder of this repo.

```bash
git clone https://github.com/hasan-web/cine-world.git
cd cine-world/cine-world
npm install
```

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
TMDB_API_KEY=
RESEND_API_KEY=
```

Run the schema in `supabase/schema.sql` against a Supabase project, then:

```bash
npm run dev
```

## License

Personal project — not currently set up for external contributions, but feel free to poke around the code.
