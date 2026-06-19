import { NextRequest, NextResponse } from "next/server";
import { getDiscover, getMoviesByGenre } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const genre = searchParams.get("genre");
    if (genre) {
      const data = await getMoviesByGenre(parseInt(genre), page);
      return NextResponse.json(data);
    }
    const data = await getDiscover(page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
