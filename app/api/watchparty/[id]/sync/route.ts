import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const supabase = createAdminClient();
  if (!session || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { current_time, is_paused } = await request.json();

  const { error } = await supabase
    .from("watch_parties")
    .update({
      current_time,
      is_paused,
      status: "playing",
    })
    .eq("id", id)
    .eq("host_id", session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
