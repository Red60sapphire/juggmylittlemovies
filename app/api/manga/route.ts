import { NextRequest, NextResponse } from "next/server";
import { getMangaById } from "@/lib/mangadex";
import { getALSearch, getALAll } from "@/lib/anilist";
import { rateLimit } from "@/lib/rate-limit";

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
      if (id.startsWith("al-")) {
        const { manga } = await getALAll(1, 1);
        const found = manga.find((m: any) => m.id === id);
        return NextResponse.json({ manga: found || null });
      }
      const manga = await getMangaById(id);
      return NextResponse.json({ manga });
    }

    if (query) {
      const al = await getALSearch(query);
      return NextResponse.json({ manga: al.manga, total: al.hasNext ? 50 : 0 });
    }

    const page = Math.floor(offset / 50) + 1;
    const al = await getALAll(page, 50);
    return NextResponse.json({ manga: al.manga, total: 10000 });
  } catch {
    return NextResponse.json({ manga: [], total: 0 });
  }
}
