import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const body = (await request.json()) as { state?: string; position?: number; hostKey?: string };
  const { data: room } = await supabase
    .from("watch_party_rooms")
    .select("host_user_id, host_key")
    .eq("id", id)
    .maybeSingle();

  const hasUserHost = Boolean(session?.userId && room?.host_user_id === session.userId);
  const hasGuestHost = Boolean(body.hostKey && room?.host_key === body.hostKey);
  if (!room || (!hasUserHost && !hasGuestHost)) {
    return NextResponse.json({ error: "Host only." }, { status: 403 });
  }

  const state = body.state === "play" ? "play" : "pause";
  const position = Math.max(0, Number(body.position) || 0);

  const { error } = await supabase.from("watch_party_sync_state").upsert(
    { room_id: id, state, position, updated_at: new Date().toISOString() },
    { onConflict: "room_id", ignoreDuplicates: false }
  );

  if (error) return NextResponse.json({ error: "Could not save sync state." }, { status: 500 });
  return NextResponse.json({ ok: true, state, position });
}
