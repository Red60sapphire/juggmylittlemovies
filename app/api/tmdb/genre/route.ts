import { NextRequest, NextResponse } from "next/server";
import { discoverByGenre, discoverByGenreMultiPage } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const mediaType = request.nextUrl.searchParams.get("type") || "movie";
  const genreId = parseInt(request.nextUrl.searchParams.get("id") || "0");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const allPages = request.nextUrl.searchParams.get("all") === "true";

  if (!genreId) {
    return NextResponse.json({ error: "Missing genre id" }, { status: 400 });
  }

  try {
    const data = allPages
      ? await discoverByGenreMultiPage(mediaType as "movie" | "tv", genreId)
      : await discoverByGenre(mediaType as "movie" | "tv", genreId, page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
