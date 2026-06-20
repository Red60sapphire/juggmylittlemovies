import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

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

  const { movie_id, movie_title, poster_path, backdrop_path, is_tv, season_number, episode_number } = await request.json();

  let invite_code = generateInviteCode();
  const { data: existing } = await supabase
    .from("watch_parties")
    .select("invite_code")
    .eq("invite_code", invite_code)
    .maybeSingle();
  if (existing) {
    invite_code = generateInviteCode();
  }

  const { data, error } = await supabase
    .from("watch_parties")
    .insert({
      host_id: user.id,
      movie_id,
      movie_title,
      poster_path,
      backdrop_path,
      is_tv: is_tv || false,
      season_number: season_number || null,
      episode_number: episode_number || null,
      invite_code,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("watch_party_members").insert({
    party_id: data.id,
    user_id: user.id,
    display_name: user.email?.split("@")[0] || "Host",
  });

  return NextResponse.json(data);
}
