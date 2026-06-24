import { NextRequest, NextResponse } from "next/server";
import { getMangaList, getMangaById } from "@/lib/mangadex";
import { getALTrending, getALSearch, getALAll } from "@/lib/anilist";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`manga:${ip}`, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
  const limitNum = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const query = request.nextUrl.searchParams.get("q") || "";
  const id = request.nextUrl.searchParams.get("id") || "";

  try {
    if (id) {
      if (id.startsWith("al-")) {
        const { getALAll } = await import("@/lib/anilist");
        const { manga } = await getALAll(1, 1);
        const found = manga.find((m: any) => m.id === id);
        return NextResponse.json({ manga: found || null });
      }
      const manga = await getMangaById(id);
      return NextResponse.json({ manga });
    }

    if (query) {
      if (offset === 0) {
        const [md, al] = await Promise.all([
          getMangaList(0, 20, query),
          getALSearch(query),
        ]);
        const merged = [...md.manga, ...al.manga];
        return NextResponse.json({ manga: merged, total: md.total + (al.hasNext ? 50 : 0) });
      }
      const md = await getMangaList(offset, limitNum, query);
      return NextResponse.json(md);
    }

    const page = Math.floor(offset / 50) + 1;
    if (offset < 100) {
      const [md, al] = await Promise.all([
        getMangaList(offset, limitNum),
        getALAll(page, 50),
      ]);
      const merged = [...md.manga, ...al.manga];
      return NextResponse.json({ manga: merged, total: Math.max(md.total, 10000) });
    }

    const al = await getALAll(page, 50);
    return NextResponse.json({ manga: al.manga, total: 10000 });
  } catch {
    return NextResponse.json({ manga: [], total: 0 });
  }
}
