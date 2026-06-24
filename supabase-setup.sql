-- ============================================================
-- Supabase Setup SQL — run this in your Supabase SQL editor
-- ============================================================

-- Enable RLS on all tables
alter table if exists public.profiles enable row level security;
alter table if exists public.watch_history enable row level security;
alter table if exists public.watchlist enable row level security;
alter table if exists public.watch_party_rooms enable row level security;
alter table if exists public.watch_party_participants enable row level security;
alter table if exists public.watch_party_messages enable row level security;
alter table if exists public.watch_party_kicks enable row level security;

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
  role text default 'viewer',
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

-- 8. WATCH PARTY SYNC STATE (persisted playback position for late joiners)
create table if not exists public.watch_party_sync_state (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade unique,
  state text not null default 'pause',
  position float not null default 0,
  updated_at timestamptz default now()
);

-- 9. VIEW: public rooms (for listing)
create or replace view public.watch_party_public_rooms
with (security_invoker=true) as
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
create index if not exists idx_wp_sync_room on public.watch_party_sync_state(room_id);

-- ============================================================
-- RLS POLICIES — allow all operations since auth is handled
-- by the application layer (custom session cookies + API checks)
-- ============================================================

-- PROFILES: anyone can insert (signup), read, update
drop policy if exists "profiles_all" on public.profiles;
create policy "profiles_all" on public.profiles
  for all using (true) with check (true);

-- WATCH HISTORY: any authenticated request can CRUD
drop policy if exists "watch_history_all" on public.watch_history;
create policy "watch_history_all" on public.watch_history
  for all using (true) with check (true);

-- WATCHLIST: any authenticated request can CRUD
drop policy if exists "watchlist_all" on public.watchlist;
create policy "watchlist_all" on public.watchlist
  for all using (true) with check (true);

-- WATCH PARTY ROOMS: anyone can create/read/update
drop policy if exists "wp_rooms_all" on public.watch_party_rooms;
create policy "wp_rooms_all" on public.watch_party_rooms
  for all using (true) with check (true);

-- WATCH PARTY PARTICIPANTS: anyone can join/leave
drop policy if exists "wp_participants_all" on public.watch_party_participants;
create policy "wp_participants_all" on public.watch_party_participants
  for all using (true) with check (true);

-- WATCH PARTY MESSAGES: anyone can read/write
drop policy if exists "wp_messages_all" on public.watch_party_messages;
create policy "wp_messages_all" on public.watch_party_messages
  for all using (true) with check (true);

-- WATCH PARTY KICKS: anyone can read/write (auth check in app)
drop policy if exists "wp_kicks_all" on public.watch_party_kicks;
create policy "wp_kicks_all" on public.watch_party_kicks
  for all using (true) with check (true);

-- WATCH PARTY SYNC STATE: anyone can read/write
drop policy if exists "wp_sync_all" on public.watch_party_sync_state;
create policy "wp_sync_all" on public.watch_party_sync_state
  for all using (true) with check (true);
alter table if exists public.watch_party_sync_state enable row level security;

-- ============================================================
-- NOTE: This app uses custom auth (username/password with
-- session cookies), NOT Supabase Auth. All authorization is
-- enforced in the API route handlers (app layer), so these
-- permissive RLS policies are safe. The anon key is used
-- directly for all database operations.
-- ============================================================

-- ============================================================
-- ENABLE REALTIME (run after table creation)
-- ============================================================
-- In Supabase Dashboard: Go to Database → Replication and
-- enable the "supabase_realtime" publication for these tables:
--   watch_party_rooms, watch_party_participants,
--   watch_party_messages, watch_party_sync_state
--
-- Or run:
--   drop publication if exists supabase_realtime;
--   create publication supabase_realtime for table
--     watch_party_rooms,
--     watch_party_participants,
--     watch_party_messages,
--     watch_party_sync_state;
