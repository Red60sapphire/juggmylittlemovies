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

  const { invite_code } = await request.json();

  const { data: party, error: partyError } = await supabase
    .from("watch_parties")
    .select("*")
    .eq("invite_code", invite_code.toUpperCase())
    .single();

  if (partyError || !party) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  if (party.status === "ended") {
    return NextResponse.json({ error: "Party has ended" }, { status: 400 });
  }

  const { error: joinError } = await supabase
    .from("watch_party_members")
    .insert({
      party_id: party.id,
      user_id: user.id,
      display_name: user.email?.split("@")[0] || "Guest",
    });

  if (joinError && joinError.code === "23505") {
    return NextResponse.json(party);
  }

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  return NextResponse.json(party);
}
