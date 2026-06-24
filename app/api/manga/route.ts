import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const MD_BASE = "https://api.mangadex.org";

async function mdFetch(path: string, params = ""): Promise<any> {
  try {
    const res = await fetch(`${MD_BASE}${path}${params ? `?${params}` : ""}`, {
      headers: { "Accept": "application/json", "User-Agent": "juggmylittlemovies/1.0" },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function mapItem(item: any) {
  const attrs = item.attributes;
  const coverFile = item.relationships?.find((r: any) => r.type === "cover_art")?.attributes?.fileName || null;
  const coverUrl = coverFile
    ? `https://uploads.mangadex.org/covers/${item.id}/${coverFile.includes(".") ? coverFile.slice(0, coverFile.lastIndexOf(".")) : coverFile}.256.jpg`
    : null;
  const title = attrs.title?.en || Object.values(attrs.title || {})[0] || "Untitled";
  return {
    id: item.id,
    title,
    coverUrl,
    coverColor: null,
    description: (attrs.description?.en || Object.values(attrs.description || {})[0] || "").slice(0, 300),
    rating: attrs.rating?.average || 0,
    year: attrs.year || null,
    status: attrs.status || "unknown",
    tags: (attrs.tags || []).map((t: any) => t.attributes?.name?.en || "").filter(Boolean),
    chapterCount: attrs.lastChapter ? parseInt(attrs.lastChapter) || 0 : 0,
    volumes: attrs.lastVolume ? parseInt(attrs.lastVolume) || null : null,
    format: attrs.originalLanguage === "ko" ? "MANHWA" : attrs.originalLanguage === "zh" ? "MANHUA" : "MANGA",
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
      const data = await mdFetch(`/manga/${id}`, "includes[]=cover_art");
      if (!data?.data) return NextResponse.json({ manga: null });
      return NextResponse.json({ manga: mapItem(data.data) });
    }

    const params = new URLSearchParams();
    params.set("limit", "50");
    params.set("offset", String(offset));
    params.set("availableTranslatedLanguage[]", "en");
    params.set("order[followedCount]", "desc");
    params.set("contentRating[]", "safe");
    params.set("contentRating[]", "suggestive");
    params.set("includes[]", "cover_art");
    if (query) params.set("title", query);

    const data = await mdFetch("/manga", params.toString());
    if (!data?.data) return NextResponse.json({ manga: [], total: 0 });

    return NextResponse.json({
      manga: data.data.map(mapItem),
      total: data.total || 0,
    });
  } catch {
    return NextResponse.json({ manga: [], total: 0 });
  }
}
