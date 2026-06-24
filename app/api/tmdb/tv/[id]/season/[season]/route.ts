import { NextResponse } from "next/server";
import { getTVSeasonDetails } from "@/lib/tmdb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  const { id, season } = await params;
  try {
    const data = await getTVSeasonDetails(parseInt(id), parseInt(season));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
