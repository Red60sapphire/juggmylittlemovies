import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { rateLimit, sanitizeInput } from "@/lib/rate-limit";

interface SignupBody {
  username?: string;
  password?: string;
}

function normalizeUsername(username: string) {
  return sanitizeInput(username.trim().toLowerCase().slice(0, 24));
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`signup:${ip}`, 5, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many signup attempts." }, { status: 429 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Accounts are unavailable." }, { status: 503 });
  }

  const body = (await request.json()) as SignupBody;
  const username = normalizeUsername(body.username || "");
  const password = (body.password || "").slice(0, 128);

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
    return NextResponse.json({ error: `Could not create account: ${error?.message || "Unknown database error. Ensure your Supabase tables exist by running supabase-setup.sql in the SQL editor."}` }, { status: 500 });
  }

  // Stremer deliberately uses username/password accounts without Supabase email auth.
  // This signed cookie is verified by Route Handlers, which then use the service role
  // client with explicit user_id checks instead of depending on auth.uid() RLS.
  await setSession({ userId: profile.id, username: profile.username, issuedAt: Date.now() });
  return NextResponse.json({ user: { id: profile.id, username: profile.username } });
}
