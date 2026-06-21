import { NextRequest, NextResponse } from "next/server";
import { searchMulti, searchMultiAllPages, searchMovies } from "@/lib/tmdb";
import { rateLimit, sanitizeInput } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`search:${ip}`, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawQuery = request.nextUrl.searchParams.get("q") || "";
  const query = sanitizeInput(rawQuery);
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const allPages = request.nextUrl.searchParams.get("all") === "true";
  const yearFrom = request.nextUrl.searchParams.get("yearFrom") || "";
  const yearTo = request.nextUrl.searchParams.get("yearTo") || "";
  const genresParam = request.nextUrl.searchParams.get("genres") || "";
  const mediaType = request.nextUrl.searchParams.get("mediaType") || "";
  const sortBy = request.nextUrl.searchParams.get("sortBy") || "popularity";

  if (!query && !genresParam && !mediaType) {
    return NextResponse.json({ error: "Missing query or filters" }, { status: 400 });
  }

  try {
    let data;
    if (allPages && query) {
      data = await searchMultiAllPages(query);
    } else if (query) {
      data = await searchMulti(query, page);
    } else {
      data = { results: [], page: 1, total_pages: 0, total_results: 0 };
    }

    if ((!data.results || data.results.length === 0) && query && !allPages) {
      const fallback = await searchMulti(query.slice(0, -1));
      if (fallback.results && fallback.results.length > 0) {
        return NextResponse.json(fallback);
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
