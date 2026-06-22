-- ============================================================
-- Supabase Setup SQL — run this in your Supabase SQL editor
-- ============================================================

-- 1. PROFILES (user accounts)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 2. WATCH HISTORY
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  movie_id int not null,
  title text not null,
  poster_path text,
  progress float default 0,
  duration float default 0,
  watched_at timestamptz default now()
);

-- 3. WATCHLIST
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  movie_id int not null,
  title text not null,
  poster_path text,
  vote_average text,
  added_at timestamptz default now()
);

-- 4. WATCH PARTY ROOMS
create table if not exists public.watch_party_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  movie_id int not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  host_user_id uuid references public.profiles(id),
  host_key text not null,
  host_name text not null,
  is_public boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- 5. WATCH PARTY PARTICIPANTS
create table if not exists public.watch_party_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id),
  display_name text not null,
  role text default 'viewer', -- 'host' or 'viewer'
  joined_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  unique(room_id, display_name)
);

-- 6. WATCH PARTY MESSAGES
create table if not exists public.watch_party_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  display_name text not null,
  body text not null,
  created_at timestamptz default now()
);

-- 7. WATCH PARTY KICKS
create table if not exists public.watch_party_kicks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);

-- 8. VIEW: public rooms (for listing)
create or replace view public.watch_party_public_rooms as
select
  r.id,
  r.code,
  r.title,
  r.poster_path,
  r.host_name,
  (select count(*) from public.watch_party_participants p where p.room_id = r.id) as participant_count
from public.watch_party_rooms r
where r.active = true and r.is_public = true
order by r.created_at desc;

-- 9. INDEXES
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_watch_history_user on public.watch_history(user_id);
create index if not exists idx_watchlist_user on public.watchlist(user_id);
create index if not exists idx_wp_rooms_code on public.watch_party_rooms(code);
create index if not exists idx_wp_rooms_active on public.watch_party_rooms(active);
create index if not exists idx_wp_participants_room on public.watch_party_participants(room_id);
create index if not exists idx_wp_messages_room on public.watch_party_messages(room_id);
