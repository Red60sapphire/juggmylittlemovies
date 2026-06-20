import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    configured: isSupabaseConfigured(),
    user: session ? { id: session.userId, username: session.username } : null,
  });
}
