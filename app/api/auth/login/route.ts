import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, sanitizeInput } from "@/lib/rate-limit";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`login:${ip}`, 10, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many login attempts." }, { status: 429 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Accounts are unavailable." }, { status: 503 });
  }

  const body = (await request.json()) as LoginBody;
  const username = sanitizeInput((body.username || "").trim().toLowerCase().slice(0, 24));
  const password = (body.password || "").slice(0, 128);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (!profile || !verifyPassword(password, profile.password_hash)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  await setSession({ userId: profile.id, username: profile.username, issuedAt: Date.now() });
  return NextResponse.json({ user: { id: profile.id, username: profile.username } });
}
