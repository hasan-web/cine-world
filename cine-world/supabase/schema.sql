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
