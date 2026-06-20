import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { isPublic?: boolean; hostKey?: string };
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

  await supabase.from("watch_party_rooms").update({ is_public: Boolean(body.isPublic) }).eq("id", id);
  return NextResponse.json({ success: true, isPublic: Boolean(body.isPublic) });
}
