-- Constellation: films table, one row per specimen a user has logged.
-- Composite primary key (user_id, id) lets each user have their own "chungking-express"
-- slug without colliding with anyone else's.

create table if not exists public.films (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  director text not null,
  year integer not null,
  country text not null,
  rating integer not null check (rating between 1 and 5),
  cluster text not null check (cluster in ('solitudo', 'amplitudo', 'domus', 'lacrima')),
  note text,
  rewatches jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.films enable row level security;

create policy "Users can view their own films"
  on public.films for select
  using (auth.uid() = user_id);

create policy "Users can insert their own films"
  on public.films for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own films"
  on public.films for update
  using (auth.uid() = user_id);

create policy "Users can delete their own films"
  on public.films for delete
  using (auth.uid() = user_id);

-- Plate V: "the commons" — everyone's placement of a given film, anonymized. RLS
-- above intentionally blocks reading other users' rows directly; this function is
-- the one deliberate, narrow exception, and it only ever returns cluster + rating,
-- never user_id, title, note, or anything else identifying.
create or replace function public.film_commons(film_id text)
returns table (cluster text, rating int)
language sql
security definer
set search_path = public
as $$
  select cluster, rating
  from public.films
  where id = film_id
  order by cluster, rating;
$$;

grant execute on function public.film_commons(text) to authenticated;

-- Friendships: mutual-consent, not one-way following — seeing someone's full
-- collection (see the films policy below) is intimate enough that both sides
-- should have agreed to it. Created before profiles below since that table's
-- policy references this one.
create table if not exists public.friendships (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friendships enable row level security;

create policy "Users can view their own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Addressee can accept a request"
  on public.friendships for update
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id);

create policy "Either party can remove a friendship"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- A lightweight public-facing mirror of auth.users(id, email). auth.users itself
-- isn't queryable from the client, so this is the standard Supabase pattern for
-- displaying who a friend request is from/to.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Deliberately not "any authenticated user can read any profile" — that would let
-- anyone harvest every registered email. Visibility is scoped to an actual
-- friendship row (pending or accepted), since you need to see who a request is
-- from/to before deciding, not just after accepting.
create policy "Related users can view each other's profile"
  on public.profiles for select
  using (
    exists (
      select 1 from public.friendships
      where (requester_id = auth.uid() and addressee_id = profiles.id)
         or (addressee_id = auth.uid() and requester_id = profiles.id)
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill accounts that were created before this trigger existed.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Narrow lookup for sending a request: resolves an email to a user id and nothing
-- else. Never exposes the profiles/auth.users table itself.
create or replace function public.find_user_by_email(lookup_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = lookup_email limit 1;
$$;

grant execute on function public.find_user_by_email(text) to authenticated;

-- Once mutually accepted, friends can see each other's full collection — unlike
-- film_commons above, this is intentionally not anonymized, since that's the
-- whole point of a taste-twin comparison. Still gated to an actual accepted
-- relationship, not a blanket policy.
create policy "Friends can view each other's films"
  on public.films for select
  using (
    exists (
      select 1 from public.friendships
      where status = 'accepted'
        and ((requester_id = auth.uid() and addressee_id = films.user_id)
          or (addressee_id = auth.uid() and requester_id = films.user_id))
    )
  );

-- The date a specimen was actually watched, distinct from the film's own release year
-- (already stored in `year`) and from `created_at` (when the row was inserted, which
-- doesn't let you log something retroactively). Backfilled from created_at for existing
-- rows, defaults to today for new ones.
alter table public.films add column if not exists watched_on date;
update public.films set watched_on = created_at::date where watched_on is null;
alter table public.films alter column watched_on set not null;
alter table public.films alter column watched_on set default current_date;

-- Imported films arrive with no mood: a Letterboxd export knows what you watched and how you
-- rated it, but nothing about how it felt, and guessing would fabricate exactly the judgement
-- the app exists to record. So cluster becomes nullable — null means "waiting to be placed".
-- Unplaced films are deliberately kept out of the sky until their owner places them.
--
-- Note the existing `cluster in (...)` check still holds: in SQL a check constraint passes when
-- it evaluates to null, so nulls are admitted without weakening the constraint on real values.
alter table public.films alter column cluster drop not null;

-- Real, anonymized usage numbers for the public /movies/[slug] pages ("14 people have logged
-- this"). A public catalog entry and a real logged film share one id whenever title and year
-- agree (see filmId() in film-id.ts), so this is a plain aggregate over the same films table
-- film_commons already reads from — same anonymization guarantee: no user_id, no note, no
-- rewatch content, nothing but counts.
--
-- The threshold is the part film_commons didn't need, because film_commons is only ever called
-- from inside the authenticated app by someone who already has a relationship to the data (their
-- own collection, or a friend who agreed to share). This function is callable by anyone, signed in
-- or not, for any film id someone cares to guess. A raw count of one is de-anonymizing on its own —
-- "1 person logged this, rated it 5, filed it under Lacrima" identifies a specific person to
-- anyone who already suspects who it was. Returning zero rows below the threshold, rather than a
-- row with small numbers, means there is nothing for a caller to work with either way.
create or replace function public.public_film_stats(p_film_id text)
returns table (log_count bigint, rewatch_count bigint, avg_rating numeric, top_cluster text)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select cluster, rating, jsonb_array_length(coalesce(rewatches, '[]'::jsonb)) as n_rewatches
    from public.films
    where id = p_film_id
  ),
  totals as (
    select count(*) as log_count, coalesce(sum(n_rewatches), 0) as rewatch_count, avg(rating) as avg_rating
    from base
  ),
  top as (
    select cluster from base where cluster is not null group by cluster order by count(*) desc limit 1
  )
  select t.log_count, t.rewatch_count, round(t.avg_rating, 1), top.cluster
  from totals t
  left join top on true
  where t.log_count >= 5
$$;

-- Grants to anon too, deliberately — this is read by signed-out visitors on public movie pages,
-- not just from inside the authenticated app.
grant execute on function public.public_film_stats(text) to anon, authenticated;

-- A public, opt-in "share your sky" link. Null by default — nobody's collection is reachable this
-- way until they deliberately generate a link from inside the app (see public_sky_by_token()
-- below). A random token rather than the account's own id, so the link can be revoked (generate a
-- new one, the old URL stops working) without touching the account itself, and so the URL never
-- doubles as a permanent, unrevokable pointer to someone's internal id.
alter table public.profiles add column if not exists share_token uuid unique;

-- Real, anonymized-of-identity placements for a public "my sky" page — same anonymization shape as
-- film_commons and public_film_stats (security definer, no note, no watched_on, no rewatch
-- content), scoped to whichever single account this token belongs to. Returns nothing at all for a
-- token that doesn't match any profile, which covers both "never generated" and "revoked" the same
-- way, on purpose — a caller can't tell those two apart from the response.
create or replace function public.public_sky_by_token(p_token uuid)
returns table (id text, title text, cluster text, rating int)
language sql
stable
security definer
set search_path = public
as $$
  select f.id, f.title, f.cluster, f.rating
  from public.films f
  join public.profiles p on p.id = f.user_id
  where p.share_token = p_token
    and f.cluster is not null
$$;

grant execute on function public.public_sky_by_token(uuid) to anon, authenticated;

-- profiles was created with two SELECT policies and nothing else. generateShareToken() /
-- revokeShareToken() update this table from inside the app using the RLS-enforced client, and with
-- no UPDATE policy, RLS silently drops the write: zero rows change, no error is raised, and the
-- client-returned token gets shown in the UI as if it saved. The real fix is this policy — anyone
-- who generated a share link before this ran needs to generate a new one, since the old token was
-- never actually persisted. `drop ... if exists` first: `create policy` has no `if not exists`
-- form, and this file is re-run as new blocks are appended.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- User-created groupings, separate from the four fixed moods — "rainy sunday comfort" rather than
-- a mood cluster. The id is generated client-side with crypto.randomUUID() (same pattern as
-- share_token), not a DB default, since nothing here needs DB-side generation.
create table if not exists public.collections (
  id uuid not null primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;

drop policy if exists "Users can view their own collections" on public.collections;
create policy "Users can view their own collections"
  on public.collections for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own collections" on public.collections;
create policy "Users can insert their own collections"
  on public.collections for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own collections" on public.collections;
create policy "Users can update their own collections"
  on public.collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own collections" on public.collections;
create policy "Users can delete their own collections"
  on public.collections for delete
  using (auth.uid() = user_id);

-- Which films sit in which collection. user_id is denormalized onto this table (not just reached
-- through collections or films) so every query here can filter with an explicit .eq("user_id", ...)
-- the same way films.ts now does — see the RLS lesson in that file's listFilms() comment. The
-- composite FK ties film_id to films' own composite primary key, so a row here can never point at
-- another user's specimen even if collection_id and film_id were both guessed correctly.
create table if not exists public.collection_films (
  collection_id uuid not null references public.collections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  film_id text not null,
  added_at timestamptz not null default now(),
  primary key (collection_id, film_id),
  foreign key (user_id, film_id) references public.films(user_id, id) on delete cascade
);

alter table public.collection_films enable row level security;

drop policy if exists "Users can view their own collection films" on public.collection_films;
create policy "Users can view their own collection films"
  on public.collection_films for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own collection films" on public.collection_films;
create policy "Users can insert their own collection films"
  on public.collection_films for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own collection films" on public.collection_films;
create policy "Users can delete their own collection films"
  on public.collection_films for delete
  using (auth.uid() = user_id);
