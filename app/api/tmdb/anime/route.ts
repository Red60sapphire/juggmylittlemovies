import { NextRequest, NextResponse } from "next/server";
import { getAnime, searchAnime, searchAnimeAllPages, getAnimeMultiPage } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") || "1";
  const query = request.nextUrl.searchParams.get("q") || "";
  const allPages = request.nextUrl.searchParams.get("all") === "true";

  try {
    if (query) {
      const data = allPages
        ? await searchAnimeAllPages(query)
        : await searchAnime(query, parseInt(page));
      return NextResponse.json(data);
    }
    const data = allPages
      ? await getAnimeMultiPage()
      : await getAnime(parseInt(page));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
