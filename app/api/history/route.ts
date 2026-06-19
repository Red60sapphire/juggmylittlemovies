import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movie_id, title, poster_path, progress, duration } = await request.json();

  const { data: existing } = await supabase
    .from("watch_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movie_id)
    .single();

  if (existing) {
    await supabase
      .from("watch_history")
      .update({ progress, duration, watched_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("watch_history").insert({
      user_id: user.id,
      movie_id,
      title,
      poster_path,
      progress,
      duration,
    });
  }

  return NextResponse.json({ success: true });
}
