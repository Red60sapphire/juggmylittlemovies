import { NextRequest, NextResponse } from "next/server";

const SQL = `
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_profiles_username on public.profiles(username);
alter table if exists public.profiles enable row level security;
drop policy if exists "profiles_all" on public.profiles;
create policy "profiles_all" on public.profiles for all using (true) with check (true);

create table if not exists public.watch_party_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  movie_id integer,
  title text not null,
  poster_path text,
  backdrop_path text,
  host_user_id uuid references public.profiles(id) on delete set null,
  host_key text not null,
  host_name text not null,
  is_public boolean default true,
  active boolean default true,
  created_at timestamptz default now()
);
alter table if exists public.watch_party_rooms enable row level security;
drop policy if exists "rooms_all" on public.watch_party_rooms;
create policy "rooms_all" on public.watch_party_rooms for all using (true) with check (true);

create table if not exists public.watch_party_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  role text not null default 'viewer',
  joined_at timestamptz default now(),
  last_seen_at timestamptz default now()
);
alter table if exists public.watch_party_participants enable row level security;
drop policy if exists "participants_all" on public.watch_party_participants;
create policy "participants_all" on public.watch_party_participants for all using (true) with check (true);

create table if not exists public.watch_party_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  body text not null,
  created_at timestamptz default now()
);
alter table if exists public.watch_party_messages enable row level security;
drop policy if exists "messages_all" on public.watch_party_messages;
create policy "messages_all" on public.watch_party_messages for all using (true) with check (true);

create table if not exists public.watch_party_kicks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.watch_party_rooms(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);
alter table if exists public.watch_party_kicks enable row level security;
drop policy if exists "kicks_all" on public.watch_party_kicks;
create policy "kicks_all" on public.watch_party_kicks for all using (true) with check (true);

create or replace view public.watch_party_public_rooms with (security_invoker=true) as
select r.id, r.code, r.movie_id, r.title, r.poster_path, r.backdrop_path, r.host_name, r.created_at,
  coalesce(p.count, 0) as participant_count
from public.watch_party_rooms r
left join (
  select room_id, count(*) as count
  from public.watch_party_participants
  group by room_id
) p on p.room_id = r.id
where r.is_public = true and r.active = true
order by r.created_at desc;
`;

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, error: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 400 });
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/sql",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: SQL,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ ok: false, error: `SQL exec failed (${res.status}): ${text.slice(0, 500)}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
