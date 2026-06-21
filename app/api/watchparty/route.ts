import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const supabase = createAdminClient();
  if (!session || !supabase) {
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
      host_id: session.userId,
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
    user_id: session.userId,
    display_name: session.username || "Host",
  });

  return NextResponse.json(data);
}
