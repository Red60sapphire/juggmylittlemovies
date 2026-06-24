import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const REQUIRED_TABLES = [
  "profiles",
  "watch_history",
  "watchlist",
  "watch_party_rooms",
  "watch_party_participants",
  "watch_party_messages",
  "watch_party_kicks",
];

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return NextResponse.json({
      ok: false,
      error: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
      tables: [],
    }, { status: 400 });
  }

  const client = createClient(url, anonKey);

  const tableStatus: Record<string, boolean> = {};
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await client.from(table).select("id", { count: "exact", head: true }).limit(0);
      tableStatus[table] = !error;
    } catch {
      tableStatus[table] = false;
    }
  }

  const allExist = Object.values(tableStatus).every(Boolean);

  if (!allExist && serviceKey) {
    const admin = createClient(url, serviceKey);
    let sqlOk = false;
    let sqlError = "";
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/sql",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: [
          REQUIRED_TABLES.map((t) => `create table if not exists public.${t} (id uuid primary key default gen_random_uuid());`).join("\n"),
          `alter table if exists public.profiles add column if not exists username text;`,
          `alter table if exists public.profiles add column if not exists password_hash text;`,
        ].join("\n"),
      });
      if (!res.ok) sqlError = `SQL exec failed (${res.status})`;
      else sqlOk = true;
    } catch (e: any) {
      sqlError = e?.message || "Unknown error";
    }
    if (sqlOk) {
      return NextResponse.json({ ok: true, tables: tableStatus, created: true });
    }
  }

  const missing = REQUIRED_TABLES.filter((t) => !tableStatus[t]);
  return NextResponse.json({
    ok: allExist,
    tables: tableStatus,
    missing: missing.length > 0 ? missing : undefined,
    message: allExist
      ? "All tables exist."
      : serviceKey
        ? "Attempted creation but some tables may still be missing. Run supabase-setup.sql in the Supabase SQL Editor."
        : "Missing tables. Set SUPABASE_SERVICE_ROLE_KEY env var for auto-setup, or run supabase-setup.sql in Supabase SQL Editor.",
  }, { status: allExist ? 200 : 400 });
}
