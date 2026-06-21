import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json([]);

  const { data: members } = await supabase
    .from("watch_party_members")
    .select("id, party_id, user_id, display_name, joined_at")
    .eq("party_id", id)
    .order("joined_at", { ascending: true });

  return NextResponse.json(members || []);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const supabase = createAdminClient();
  if (!session || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user_id } = await request.json();
  const targetId = user_id || session.userId;

  await supabase
    .from("watch_party_members")
    .delete()
    .eq("party_id", id)
    .eq("user_id", targetId);

  return NextResponse.json({ success: true });
}
