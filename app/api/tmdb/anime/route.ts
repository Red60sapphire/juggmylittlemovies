import { NextRequest, NextResponse } from "next/server";
import { getAnime, searchAnime, searchAnimeAllPages, getAnimeMultiPage } from "@/lib/tmdb";
import { rateLimit, sanitizeInput, validateNumber } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`anime:${ip}`, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const page = validateNumber(request.nextUrl.searchParams.get("page") || "1", 1, 500);
  const rawQuery = request.nextUrl.searchParams.get("q") || "";
  const query = sanitizeInput(rawQuery);
  const allPages = request.nextUrl.searchParams.get("all") === "true";

  try {
    if (query) {
      const data = allPages
        ? await searchAnimeAllPages(query)
        : await searchAnime(query, page);
      return NextResponse.json(data);
    }
    const data = allPages
      ? await getAnimeMultiPage()
      : await getAnime(page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
