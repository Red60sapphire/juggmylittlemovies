import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

interface JoinBody {
  code?: string;
  roomId?: string;
  displayName?: string;
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const session = await getSession();
  if (!supabase) return NextResponse.json({ error: "Watch parties are unavailable." }, { status: 503 });

  const body = (await request.json()) as JoinBody;
  const displayName = (session?.username || body.displayName || "").trim().slice(0, 32);
  if (!displayName) {
    return NextResponse.json({ error: "Choose a display name." }, { status: 400 });
  }

  const query = supabase
    .from("watch_party_rooms")
    .select("id, code, active")
    .eq("active", true)
    .limit(1);

  const { data: rooms } = body.roomId
    ? await query.eq("id", body.roomId)
    : await query.eq("code", (body.code || "").trim());

  const room = rooms?.[0];
  if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });

  const { data: kicked } = await supabase
    .from("watch_party_kicks")
    .select("id")
    .eq("room_id", room.id)
    .eq("display_name", displayName)
    .maybeSingle();

  if (kicked) {
    return NextResponse.json({ error: "You were removed from this room." }, { status: 403 });
  }

  const { data: participant } = await supabase
    .from("watch_party_participants")
    .upsert({
      room_id: room.id,
      user_id: session?.userId ?? null,
      display_name: displayName,
      role: "viewer",
      last_seen_at: new Date().toISOString(),
    }, { onConflict: "room_id,display_name" })
    .select("id, display_name, role")
    .single();

  return NextResponse.json({ roomId: room.id, participant, displayName });
}
