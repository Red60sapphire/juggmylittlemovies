import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Watch parties are unavailable." }, { status: 503 });

  const { data: room } = await supabase
    .from("watch_party_rooms")
    .select("id, code, movie_id, title, poster_path, backdrop_path, host_user_id, host_name, is_public, active, created_at")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });

  const { data: participants } = await supabase
    .from("watch_party_participants")
    .select("id, display_name, role, last_seen_at")
    .eq("room_id", id)
    .order("joined_at", { ascending: true });

  const { data: messages } = await supabase
    .from("watch_party_messages")
    .select("id, display_name, body, created_at")
    .eq("room_id", id)
    .order("created_at", { ascending: true })
    .limit(100);

  const { data: syncState } = await supabase
    .from("watch_party_sync_state")
    .select("state, position, updated_at")
    .eq("room_id", id)
    .maybeSingle();

  const session = await getSession();
  const isHost = Boolean(session?.userId && session.userId === room.host_user_id);
  return NextResponse.json({
    room, sync: syncState || null,
    participants: participants || [], messages: messages || [],
    isHost, user: session,
  });
}
