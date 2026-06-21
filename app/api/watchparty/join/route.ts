import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const supabase = createAdminClient();
  if (!session || !supabase) {
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
      user_id: session.userId,
      display_name: session.username || "Guest",
    });

  if (joinError && joinError.code === "23505") {
    return NextResponse.json(party);
  }

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  return NextResponse.json(party);
}
