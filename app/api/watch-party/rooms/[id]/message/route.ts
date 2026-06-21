import { NextRequest, NextResponse } from "next/server";
import { filterChatMessage } from "@/lib/chat-filter";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

interface MessageBody {
  displayName?: string;
  body?: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Chat requires Supabase." }, { status: 503 });

  const session = await getSession();
  const payload = (await request.json()) as MessageBody;
  const displayName = (session?.username || payload.displayName || "").trim().slice(0, 32);
  const filtered = filterChatMessage(payload.body || "");

  if (!displayName || !filtered.clean) {
    return NextResponse.json({ error: "Message is empty." }, { status: 400 });
  }

  const { data: participant } = await supabase
    .from("watch_party_participants")
    .select("id")
    .eq("room_id", id)
    .eq("display_name", displayName)
    .maybeSingle();

  if (!participant) return NextResponse.json({ error: "Join the room before chatting." }, { status: 403 });

  const { data: message, error } = await supabase
    .from("watch_party_messages")
    .insert({ room_id: id, user_id: session?.userId ?? null, display_name: displayName, body: filtered.clean })
    .select("id, display_name, body, created_at")
    .single();

  if (error || !message) return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  return NextResponse.json({ message, censored: filtered.blocked });
}
