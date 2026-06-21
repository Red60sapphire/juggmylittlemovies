import { NextRequest, NextResponse } from "next/server";
import { searchMulti, searchMultiAllPages, searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const allPages = request.nextUrl.searchParams.get("all") === "true";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    let data;
    if (allPages) {
      data = await searchMultiAllPages(query);
    } else {
      data = await searchMulti(query, page);
    }

    if ((!data.results || data.results.length === 0) && !allPages) {
      const fallback = await searchMulti(query.substring(0, query.length - 1));
      if (fallback.results && fallback.results.length > 0) {
        return NextResponse.json(fallback);
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
