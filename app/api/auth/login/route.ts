import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Accounts are unavailable." }, { status: 503 });
  }

  const body = (await request.json()) as LoginBody;
  const username = (body.username || "").trim().toLowerCase();
  const password = body.password || "";

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
