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
