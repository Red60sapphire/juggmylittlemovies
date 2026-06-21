import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS, UserSettings } from "@/lib/settings";

export async function GET() {
  const session = await getSession();
  const supabase = await createAdminClient();
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
  const session = await getSession();
  const supabase = await createAdminClient();
  const settings = (await request.json()) as Partial<UserSettings>;
  if (!session || !supabase) {
    return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...settings }, synced: false });
  }

  const merged = { ...DEFAULT_SETTINGS, ...settings };
  await supabase.from("profiles").update({ settings: merged }).eq("id", session.userId);
  return NextResponse.json({ settings: merged, synced: true });
}
