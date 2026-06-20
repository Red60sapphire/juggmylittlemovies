-- juggmylittlemovies custom username/password accounts and Supabase Realtime watch parties.
-- Auth note: the app intentionally does not use Supabase email/password auth or synthetic emails.
-- Route Handlers verify a signed session cookie and use the service-role client with explicit
-- user ownership checks. RLS remains enabled for defense-in-depth and for future native auth use.

create extension if not exists citext;
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username citext not null unique,
  password_hash text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watch_party_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  movie_id integer not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  host_user_id uuid references public.profiles(id) on delete set null,
  host_key text not null,
  host_name text not null,
  is_public boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watch_party_code_format check (code ~ '^[0-9]{6}$')
);

create unique index if not exists watch_party_active_code_idx
  on public.watch_party_rooms (code)
  where active = true;

create table if not exists public.watch_party_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  role text not null default 'viewer' check (role in ('host', 'viewer')),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_id, display_name)
);

create table if not exists public.watch_party_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  body text not null check (char_length(body) between 1 and 600),
  created_at timestamptz not null default now()
);

create table if not exists public.watch_party_kicks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (room_id, display_name)
);

create index if not exists watch_party_rooms_public_idx on public.watch_party_rooms (is_public, active, created_at desc);
create index if not exists watch_party_messages_room_idx on public.watch_party_messages (room_id, created_at);
create index if not exists watch_party_participants_room_idx on public.watch_party_participants (room_id);

create or replace view public.watch_party_public_rooms as
select
  r.id,
  r.code,
  r.movie_id,
  r.title,
  r.poster_path,
  r.backdrop_path,
  r.host_name,
  r.created_at,
  count(p.id)::integer as participant_count
from public.watch_party_rooms r
left join public.watch_party_participants p on p.room_id = r.id
where r.active = true and r.is_public = true
group by r.id;

alter table public.profiles enable row level security;
alter table public.watch_party_rooms enable row level security;
alter table public.watch_party_participants enable row level security;
alter table public.watch_party_messages enable row level security;
alter table public.watch_party_kicks enable row level security;

create policy "profiles service role only" on public.profiles
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "rooms readable by anon for joins" on public.watch_party_rooms
  for select using (active = true);

create policy "rooms service role writes" on public.watch_party_rooms
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "participants readable for active rooms" on public.watch_party_participants
  for select using (
    exists (
      select 1 from public.watch_party_rooms r
      where r.id = room_id and r.active = true
    )
  );

create policy "participants service role writes" on public.watch_party_participants
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "messages readable to participants" on public.watch_party_messages
  for select using (
    exists (
      select 1 from public.watch_party_participants p
      where p.room_id = watch_party_messages.room_id
    )
  );

create policy "messages service role writes" on public.watch_party_messages
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "kicks service role only" on public.watch_party_kicks
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter publication supabase_realtime add table public.watch_party_rooms;
alter publication supabase_realtime add table public.watch_party_participants;
alter publication supabase_realtime add table public.watch_party_messages;
