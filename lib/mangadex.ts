const MD_BASE = "https://api.mangadex.org";

export interface MangaTitle {
  id: string;
  title: string;
  altTitles: string[];
  description: string;
  coverUrl: string | null;
  rating: number;
  year: number | null;
  status: string;
  tags: string[];
  chapterCount: number;
}

export interface MangaChapter {
  id: string;
  chapter: string;
  title: string;
  volume: string | null;
  pages: number;
  publishDate: string;
}

export interface MangaVolume {
  volume: string;
  count: number;
  chapters: MangaChapter[];
}

interface MDResponse {
  result: string;
  data: any[];
  total: number;
  limit: number;
  offset: number;
}

async function mdFetch(path: string, params = ""): Promise<any> {
  try {
    const url = `${MD_BASE}${path}${params ? `?${params}` : ""}`;
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "juggmylittlemovies/1.0",
      },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function getCoverUrl(mangaId: string, fileName: string | null): string | null {
  if (!fileName) return null;
  const base = fileName.includes(".") ? fileName.replace(/\.[^.]+$/, "") : fileName;
  return `https://uploads.mangadex.org/covers/${mangaId}/${base}.512.jpg`;
}

function extractTitle(attrs: any): string {
  const title = attrs.title;
  if (!title) return "Untitled";
  return title.en || Object.values(title)[0] as string || "Untitled";
}

function extractDescription(attrs: any): string {
  const desc = attrs.description;
  if (!desc) return "";
  return desc.en || Object.values(desc)[0] as string || "";
}

export async function getMangaList(offset = 0, limit = 20, additionalParams = ""): Promise<{ manga: MangaTitle[]; total: number }> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  params.set("availableTranslatedLanguage[]", "en");
  params.set("order[followedCount]", "desc");
  params.set("contentRating[]", "safe");
  params.set("contentRating[]", "suggestive");
  params.set("includes[]", "cover_art");
  if (additionalParams) params.set("title", additionalParams);

  const data = await mdFetch("/manga", params.toString());
  if (!data?.data) return { manga: [], total: 0 };

  const manga: MangaTitle[] = data.data.map((item: any) => {
    const attrs = item.attributes;
    const coverFile = item.relationships?.find((r: any) => r.type === "cover_art")?.attributes?.fileName || null;
    return {
      id: item.id,
      title: extractTitle(attrs),
      altTitles: (attrs.altTitles || []).map((t: any) => Object.values(t)[0] as string),
      description: extractDescription(attrs).slice(0, 300),
      coverUrl: getCoverUrl(item.id, coverFile),
      rating: attrs.rating?.average || 0,
      year: attrs.year || null,
      status: attrs.status || "unknown",
      tags: (attrs.tags || []).map((t: any) => t.attributes?.name?.en || "").filter(Boolean),
      chapterCount: attrs.lastChapter ? parseInt(attrs.lastChapter) || 0 : 0,
    };
  });

  return { manga, total: data.total };
}

export async function getMangaById(id: string): Promise<MangaTitle | null> {
  const params = new URLSearchParams();
  params.set("includes[]", "cover_art");
  params.set("includes[]", "author");
  params.set("includes[]", "artist");

  const data = await mdFetch(`/manga/${id}`, params.toString());
  if (!data?.data) return null;

  const item = data.data;
  const attrs = item.attributes;
  const coverFile = item.relationships?.find((r: any) => r.type === "cover_art")?.attributes?.fileName || null;

  return {
    id: item.id,
    title: extractTitle(attrs),
    altTitles: (attrs.altTitles || []).map((t: any) => Object.values(t)[0] as string),
    description: extractDescription(attrs),
    coverUrl: getCoverUrl(item.id, coverFile),
    rating: attrs.rating?.average || 0,
    year: attrs.year || null,
    status: attrs.status || "unknown",
    tags: (attrs.tags || []).map((t: any) => t.attributes?.name?.en || "").filter(Boolean),
    chapterCount: attrs.lastChapter ? parseInt(attrs.lastChapter) || 0 : 0,
  };
}

export async function getMangaChapters(mangaId: string, offset = 0, limit = 100): Promise<{ chapters: MangaChapter[]; total: number }> {
  const params = new URLSearchParams();
  params.set("manga", mangaId);
  params.set("translatedLanguage[]", "en");
  params.set("order[chapter]", "desc");
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const data = await mdFetch("/chapter", params.toString());
  if (!data?.data) return { chapters: [], total: 0 };

  const chapters: MangaChapter[] = data.data.map((item: any) => ({
    id: item.id,
    chapter: item.attributes.chapter || "0",
    title: item.attributes.title || "",
    volume: item.attributes.volume || null,
    pages: item.attributes.pages || 0,
    publishDate: item.attributes.publishAt || "",
  }));

  return { chapters, total: data.total };
}

export interface ChapterPagesResult {
  pages: string[];
  pagesDataSaver: string[];
  baseUrl: string;
  hash: string;
}

export async function getChapterPages(chapterId: string): Promise<ChapterPagesResult | null> {
  const data = await mdFetch(`/at-home/server/${chapterId}`);
  if (!data) return null;

  const baseUrl = data.baseUrl || "https://uploads.mangadex.org";
  const chapter = data.chapter;
  if (!chapter) return null;

  const hash = chapter.hash;
  const pages = (chapter.data || []).map(
    (f: string) => `${baseUrl}/data/${hash}/${f}`
  );
  const pagesDataSaver = (chapter.dataSaver || []).map(
    (f: string) => `${baseUrl}/data-saver/${hash}/${f}`
  );

  return { pages, pagesDataSaver, baseUrl, hash };
}

export const MANGA_GENRES = [
  { id: "action", name: "Action" },
  { id: "adventure", name: "Adventure" },
  { id: "comedy", name: "Comedy" },
  { id: "drama", name: "Drama" },
  { id: "fantasy", name: "Fantasy" },
  { id: "horror", name: "Horror" },
  { id: "mystery", name: "Mystery" },
  { id: "romance", name: "Romance" },
  { id: "sci-fi", name: "Sci-Fi" },
  { id: "thriller", name: "Thriller" },
  { id: "slice-of-life", name: "Slice of Life" },
  { id: "sports", name: "Sports" },
];
