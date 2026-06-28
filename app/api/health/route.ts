import { NextResponse } from "next/server";

const REQUIRED_TABLES = [
  "profiles",
  "watch_history",
  "watchlist",
];

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Supabase not configured", env: { url: !!url, key: !!key } });
  }

  const tables: Record<string, boolean> = {};
  const modules: Record<string, boolean> = {
    tmdb: !!process.env.TMDB_ACCESS_TOKEN,
    auth: !!key,
    ws: !!process.env.NEXT_PUBLIC_WS_URL,
  };

  for (const table of REQUIRED_TABLES) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=0&head=true`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      tables[table] = res.status === 200;
    } catch {
      tables[table] = false;
    }
  }

  const missing = REQUIRED_TABLES.filter((t) => !tables[t]);

  return NextResponse.json({
    ok: missing.length === 0,
    env: { url: !!url, key: !!key, service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY, tmdb: modules.tmdb, ws: modules.ws },
    tables,
    missing: missing.length > 0 ? missing : undefined,
    message: missing.length === 0 ? "All systems operational." : `Missing tables: ${missing.join(", ")}`,
  });
}
