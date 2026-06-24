const AL_BASE = "https://graphql.anilist.co";

const SEARCH_QUERY = `
query ($page: Int, $perPage: Int, $search: String, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, search: $search, sort: $sort, isAdult: false) {
      id
      title { romaji english native }
      coverImage { large extraLarge color }
      description
      averageScore
      genres
      status
      chapters
      volumes
      startDate { year }
      format
    }
    pageInfo { total hasNextPage }
  }
}
`;

const TRENDING_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
      id
      title { romaji english native }
      coverImage { large extraLarge color }
      description
      averageScore
      genres
      status
      chapters
      volumes
      startDate { year }
      format
    }
    pageInfo { total hasNextPage }
  }
}
`;

interface ALTitle { romaji?: string; english?: string; native?: string }
interface ALCover { large?: string; extraLarge?: string; color?: string }
interface ALManga {
  id: number;
  title: ALTitle;
  coverImage: ALCover;
  description?: string;
  averageScore?: number;
  genres?: string[];
  status?: string;
  chapters?: number;
  volumes?: number;
  startDate?: { year?: number };
  format?: string;
}

interface ALResponse {
  data?: {
    Page?: {
      media: ALManga[];
      pageInfo: { total: number; hasNextPage: boolean };
    };
  };
}

async function alFetch(query: string, variables: Record<string, any>): Promise<ALResponse> {
  try {
    const res = await fetch(AL_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    return res.json();
  } catch { return {}; }
}

function extractALTitle(title: ALTitle): string {
  return title.english || title.romaji || title.native || "Untitled";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim();
}

function getCoverUrl(cover: ALCover, size: "large" | "extraLarge" = "large"): string | null {
  if (!cover) return null;
  const url = cover[size] || cover.large || cover.extraLarge;
  if (url) return url;
  return null;
}

export interface ALMangaItem {
  id: string;
  title: string;
  coverUrl: string | null;
  coverColor: string | null;
  description: string;
  rating: number;
  year: number | null;
  status: string;
  tags: string[];
  chapterCount: number;
  volumes: number | null;
  format: string;
  source: "anilist";
}

function mapManga(m: ALManga): ALMangaItem {
  return {
    id: `al-${m.id}`,
    title: extractALTitle(m.title),
    coverUrl: getCoverUrl(m.coverImage, "large"),
    coverColor: m.coverImage?.color || null,
    description: stripHtml(m.description || "").slice(0, 300),
    rating: (m.averageScore || 0) / 10,
    year: m.startDate?.year || null,
    status: m.status || "unknown",
    tags: m.genres || [],
    chapterCount: m.chapters || 0,
    volumes: m.volumes || null,
    format: m.format || "MANGA",
    source: "anilist",
  };
}

export async function getALTrending(page = 1, perPage = 50): Promise<{ manga: ALMangaItem[]; hasNext: boolean }> {
  const data = await alFetch(TRENDING_QUERY, { page, perPage });
  const pageData = data?.data?.Page;
  if (!pageData) return { manga: [], hasNext: false };
  return {
    manga: pageData.media.map(mapManga),
    hasNext: pageData.pageInfo.hasNextPage,
  };
}

export async function getALSearch(query: string, page = 1, perPage = 50): Promise<{ manga: ALMangaItem[]; hasNext: boolean }> {
  const data = await alFetch(SEARCH_QUERY, { page, perPage, search: query, sort: ["SEARCH_MATCH", "TRENDING_DESC"] });
  const pageData = data?.data?.Page;
  if (!pageData) return { manga: [], hasNext: false };
  return {
    manga: pageData.media.map(mapManga),
    hasNext: pageData.pageInfo.hasNextPage,
  };
}

export async function getALAll(page = 1, perPage = 50): Promise<{ manga: ALMangaItem[]; hasNext: boolean }> {
  const data = await alFetch(SEARCH_QUERY, { page, perPage, sort: ["POPULARITY_DESC", "TRENDING_DESC"] });
  const pageData = data?.data?.Page;
  if (!pageData) return { manga: [], hasNext: false };
  return {
    manga: pageData.media.map(mapManga),
    hasNext: pageData.pageInfo.hasNextPage,
  };
}
