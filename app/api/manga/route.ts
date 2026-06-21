import { NextRequest, NextResponse } from "next/server";
import { getMangaList, getMangaById, getMangaChapters, getChapterPages } from "@/lib/mangadex";

export async function GET(request: NextRequest) {
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const query = request.nextUrl.searchParams.get("q") || "";
  const id = request.nextUrl.searchParams.get("id") || "";

  try {
    if (id) {
      const manga = await getMangaById(id);
      return NextResponse.json({ manga });
    }
    const data = await getMangaList(offset, limit, query);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ manga: [], total: 0 });
  }
}
