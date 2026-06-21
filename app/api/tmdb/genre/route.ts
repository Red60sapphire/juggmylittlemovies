import { NextRequest, NextResponse } from "next/server";
import { discoverByGenre, discoverByGenreMultiPage } from "@/lib/tmdb";
import { rateLimit, validateNumber } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`genre:${ip}`, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const mediaType = request.nextUrl.searchParams.get("type") || "movie";
  const genreId = validateNumber(request.nextUrl.searchParams.get("id") || "0", 1, 10000);
  const page = validateNumber(request.nextUrl.searchParams.get("page") || "1", 1, 500);
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
