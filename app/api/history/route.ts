import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  const supabase = createAdminClient();
  if (!session || !supabase) {
    return NextResponse.json({ items: [] });
  }
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", session.userId)
    .order("watched_at", { ascending: false });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const supabase = createAdminClient();
  if (!session || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movie_id, title, poster_path, progress, duration } = await request.json();

  const { data: existing } = await supabase
    .from("watch_history")
    .select("id")
    .eq("user_id", session.userId)
    .eq("movie_id", movie_id)
    .single();

  if (existing) {
    await supabase
      .from("watch_history")
      .update({ progress, duration, watched_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("watch_history").insert({
      user_id: session.userId,
      movie_id,
      title,
      poster_path,
      progress,
      duration,
    });
  }

  return NextResponse.json({ success: true });
}
