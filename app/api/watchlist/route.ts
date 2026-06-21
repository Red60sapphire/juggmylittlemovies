import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const supabase = await createAdminClient();
  if (!session || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movie_id, title, poster_path, vote_average } = await request.json();

  const { data: existing } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", session.userId)
    .eq("movie_id", movie_id)
    .single();

  if (existing) {
    await supabase.from("watchlist").delete().eq("id", existing.id);
    return NextResponse.json({ added: false });
  }

  await supabase.from("watchlist").insert({
    user_id: session.userId,
    movie_id,
    title,
    poster_path,
    vote_average: (vote_average / 2).toFixed(1),
  });

  return NextResponse.json({ added: true });
}
