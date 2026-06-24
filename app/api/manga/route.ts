import { NextRequest, NextResponse } from "next/server";
import { getMangaList, getMangaById } from "@/lib/mangadex";
import { rateLimit } from "@/lib/rate-limit";

function toFrontend(m: any) {
  return {
    id: m.id,
    title: m.title,
    coverUrl: m.coverUrl,
    coverColor: null,
    description: m.description,
    rating: m.rating,
    year: m.year,
    status: m.status,
    tags: m.tags,
    chapterCount: m.chapterCount,
    volumes: m.volumes || null,
    format: m.format || "MANGA",
    source: "mangadex",
  };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`manga:${ip}`, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
  const query = request.nextUrl.searchParams.get("q") || "";
  const id = request.nextUrl.searchParams.get("id") || "";

  try {
    if (id) {
      const manga = await getMangaById(id);
      return NextResponse.json({ manga: manga ? toFrontend(manga) : null });
    }

    const result = await getMangaList(offset, 50, query);
    return NextResponse.json({
      manga: result.manga.map(toFrontend),
      total: result.total || 0,
    });
  } catch {
    return NextResponse.json({ manga: [], total: 0 });
  }
}
