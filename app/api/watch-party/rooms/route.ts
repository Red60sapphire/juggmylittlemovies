import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, sanitizeInput } from "@/lib/rate-limit";

interface CreateRoomBody {
  movieId?: number;
  title?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  displayName?: string;
}

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`wp-rooms:${ip}`, 20, 60000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ configured: false, rooms: [] });

  const { data } = await supabase
    .from("watch_party_public_rooms")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ configured: true, rooms: data || [] });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`wp-create:${ip}`, 10, 60000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = createAdminClient();
  const session = await getSession();
  if (!supabase) return NextResponse.json({ error: "Watch parties are unavailable." }, { status: 503 });

  const body = (await request.json()) as CreateRoomBody;
  const title = sanitizeInput((body.title || "Untitled").slice(0, 160));
  const hostName = sanitizeInput((session?.username || body.displayName || "Host").slice(0, 32));
  const hostKey = randomUUID();
  const movieId = Number(body.movieId);
  if (!Number.isFinite(movieId)) {
    return NextResponse.json({ error: "Missing movie." }, { status: 400 });
  }

  let code = makeCode();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data: collision } = await supabase
      .from("watch_party_rooms")
      .select("id")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (!collision) break;
    code = makeCode();
  }

  const { data: room, error } = await supabase
    .from("watch_party_rooms")
    .insert({
      code,
      movie_id: movieId,
      title,
      poster_path: body.posterPath ?? null,
      backdrop_path: body.backdropPath ?? null,
      host_user_id: session?.userId ?? null,
      host_key: hostKey,
      host_name: hostName,
      is_public: false,
      active: true,
    })
    .select("id, code")
    .single();

  if (error || !room) {
    return NextResponse.json({ error: "Could not create room." }, { status: 500 });
  }

  await supabase.from("watch_party_participants").insert({
    room_id: room.id,
    user_id: session?.userId ?? null,
    display_name: hostName,
    role: "host",
  });

  return NextResponse.json({ roomId: room.id, code: room.code, displayName: hostName, hostKey });
}
