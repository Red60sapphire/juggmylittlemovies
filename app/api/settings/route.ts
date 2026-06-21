import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS, UserSettings } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getSession();
  const supabase = createAdminClient();
  if (!session || !supabase) {
    return NextResponse.json({ settings: DEFAULT_SETTINGS, synced: false });
  }

  const { data } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", session.userId)
    .maybeSingle();

  return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...(data?.settings || {}) }, synced: true });
}

export async function PATCH(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`settings:${ip}`, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const session = await getSession();
  const supabase = createAdminClient();
  const body = (await request.json()) as Record<string, unknown>;
  const settings: Partial<UserSettings> = {};
  const allowed = Object.keys(DEFAULT_SETTINGS) as (keyof UserSettings)[];
  for (const key of allowed) {
    if (key in body) {
      (settings as any)[key] = body[key];
    }
  }
  if (!session || !supabase) {
    return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...settings }, synced: false });
  }

  const merged = { ...DEFAULT_SETTINGS, ...settings };
  await supabase.from("profiles").update({ settings: merged }).eq("id", session.userId);
  return NextResponse.json({ settings: merged, synced: true });
}
