import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { displayName?: string; hostKey?: string };
  const displayName = (body.displayName || "").trim();
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

  await supabase.from("watch_party_kicks").insert({ room_id: id, display_name: displayName });
  await supabase.from("watch_party_participants").delete().eq("room_id", id).eq("display_name", displayName).neq("role", "host");
  return NextResponse.json({ success: true });
}
