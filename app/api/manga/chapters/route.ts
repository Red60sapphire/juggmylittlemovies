import { NextRequest, NextResponse } from "next/server";
import { getMangaChapters } from "@/lib/mangadex";

export async function GET(request: NextRequest) {
  const mangaId = request.nextUrl.searchParams.get("mangaId") || "";

  if (!mangaId) {
    return NextResponse.json({ chapters: [], total: 0 });
  }

  try {
    const data = await getMangaChapters(mangaId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ chapters: [], total: 0 });
  }
}
