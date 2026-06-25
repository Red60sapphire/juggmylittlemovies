const FETCH_TIMEOUT_MS = 1500;

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch {
    return null;
  }
}

// ── AniList ──────────────────────────────────────────────────────────────────
async function fromAniList(title: string): Promise<string | null> {
  const query = `
    query ($search: String) {
      Page(perPage: 1) {
        media(type: MANGA, search: $search, isAdult: false) {
          coverImage { large extraLarge }
        }
      }
    }`;
  try {
    const res = await fetchWithTimeout("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query, variables: { search: title } }),
    });
    if (!res || !res.ok) return null;
    const json = await res.json();
    const cover = json?.data?.Page?.media?.[0]?.coverImage;
    return cover?.extraLarge || cover?.large || null;
  } catch {
    return null;
  }
}

// ── Open Library ─────────────────────────────────────────────────────────────
async function fromOpenLibrary(title: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=1&fields=cover_i`
    );
    if (!res || !res.ok) return null;
    const json = await res.json();
    const coverId = json?.docs?.[0]?.cover_i;
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  } catch {
    return null;
  }
}

// ── Kitsu ────────────────────────────────────────────────────────────────────
async function fromKitsu(title: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(title)}&page[limit]=1&fields[manga]=posterImage`
    );
    if (!res || !res.ok) return null;
    const json = await res.json();
    return json?.data?.[0]?.attributes?.posterImage?.original || null;
  } catch {
    return null;
  }
}

// ── Main waterfall ───────────────────────────────────────────────────────────
export async function getCoverWithFallback(
  title: string,
  mangadexCover: string | null
): Promise<string | null> {
  if (mangadexCover) return mangadexCover;

  const anilist = await fromAniList(title);
  if (anilist) return anilist;

  const openlib = await fromOpenLibrary(title);
  if (openlib) return openlib;

  const kitsu = await fromKitsu(title);
  if (kitsu) return kitsu;

  return null;
}

// ── Batch cover map for list pages ───────────────────────────────────────────
export async function getBatchCoverMap(
  items: { id: string; title: string }[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  const results = await Promise.allSettled(
    items.map(item =>
      fromAniList(item.title).then(cover => ({ id: item.id, cover }))
    )
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.cover) {
      map.set(result.value.id, result.value.cover);
    }
  }

  return map;
}
