import { NextResponse } from "next/server";
import { getTVEpisodeDetails } from "@/lib/tmdb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; season: string; episode: string }> }
) {
  const { id, season, episode } = await params;
  try {
    const data = await getTVEpisodeDetails(parseInt(id), parseInt(season), parseInt(episode));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
