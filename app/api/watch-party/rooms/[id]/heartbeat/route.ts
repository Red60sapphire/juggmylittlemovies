import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const body = (await request.json()) as { displayName?: string };
  const displayName = (body.displayName || "").trim().slice(0, 32);
  if (!displayName) return NextResponse.json({ error: "Missing name." }, { status: 400 });

  await supabase
    .from("watch_party_participants")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("room_id", id)
    .eq("display_name", displayName);

  return NextResponse.json({ ok: true });
}
