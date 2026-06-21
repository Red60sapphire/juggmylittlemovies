import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS } from "@/lib/settings";

interface SignupBody {
  username?: string;
  password?: string;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  if (!(isSupabaseConfigured())) {
    return NextResponse.json({ error: "Accounts require Supabase configuration." }, { status: 503 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Accounts are unavailable." }, { status: 503 });
  }

  const body = (await request.json()) as SignupBody;
  const username = normalizeUsername(body.username || "");
  const password = body.password || "";

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return NextResponse.json({ error: "Username must be 3-24 characters using letters, numbers, or underscores." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      username,
      password_hash: hashPassword(password),
      settings: DEFAULT_SETTINGS,
    })
    .select("id, username")
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }

  // Stremer deliberately uses username/password accounts without Supabase email auth.
  // This signed cookie is verified by Route Handlers, which then use the service role
  // client with explicit user_id checks instead of depending on auth.uid() RLS.
  await setSession({ userId: profile.id, username: profile.username, issuedAt: Date.now() });
  return NextResponse.json({ user: { id: profile.id, username: profile.username } });
}
