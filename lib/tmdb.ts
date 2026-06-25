const TMDB_BASE = "https://api.themoviedb.org/3";

export const SIMPLE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export const MOVIE_GENRES = SIMPLE_GENRES;

export const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export async function tmdbFetch(path: string, params = "") {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token || token === "placeholder") {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
  try {
    const res = await fetch(`${TMDB_BASE}${path}?language=en-US${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { results: [], page: 1, total_pages: 0, total_results: 0 };
    return res.json();
  } catch {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

export async function fetchAllPages(
  fetchFn: (page: number) => Promise<{ results: any[]; total_pages: number; total_results: number }>,
  maxPages = 20
) {
  const first = await fetchFn(1);
  if (first.total_pages <= 1) return first;

  const pagesToFetch = Math.min(first.total_pages, maxPages);
  const promises = [];
  for (let p = 2; p <= pagesToFetch; p++) {
    promises.push(fetchFn(p));
  }
  const rest = await Promise.all(promises);
  const allResults = first.results;
  for (const r of rest) {
    allResults.push(...(r.results || []));
  }
  return { results: allResults, page: 1, total_pages: pagesToFetch, total_results: first.total_results };
}

export async function getTrending() {
  return tmdbFetch("/trending/all/week");
}

export async function getTrendingMultiPage(maxPages = 5) {
  return fetchAllPages((p) => tmdbFetch("/trending/all/week", `&page=${p}`), maxPages);
}

export async function getPopular() {
  return tmdbFetch("/movie/popular");
}

export async function getPopularMultiPage(maxPages = 5) {
  return fetchAllPages((p) => tmdbFetch("/movie/popular", `&page=${p}`), maxPages);
}

export async function getTopRated() {
  return tmdbFetch("/movie/top_rated");
}

export async function getTopRatedMultiPage(maxPages = 5) {
  return fetchAllPages((p) => tmdbFetch("/movie/top_rated", `&page=${p}`), maxPages);
}

export async function getNowPlaying() {
  return tmdbFetch("/movie/now_playing");
}

export async function getUpcoming() {
  return tmdbFetch("/movie/upcoming");
}

export async function getTrendingTV() {
  return tmdbFetch("/trending/tv/week");
}

export async function getTrendingTVMultiPage(maxPages = 5) {
  return fetchAllPages((p) => tmdbFetch("/trending/tv/week", `&page=${p}`), maxPages);
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch(
    "/search/multi",
    `&query=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function searchMultiAllPages(query: string, maxPages = 5) {
  return fetchAllPages((p) => searchMulti(query, p), maxPages);
}

export async function searchCollection(query: string) {
  const data = await tmdbFetch(
    "/search/movie",
    `&query=${encodeURIComponent(query)}&page=1`
  );
  return data.results || [];
}

export async function getMovieDetails(id: number) {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token || token === "placeholder") {
    return { id, title: "Movie", overview: "", poster_path: null, backdrop_path: null, vote_average: 0, genres: [], runtime: 0 };
  }
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${id}?language=en-US&append_to_response=credits,videos,similar`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return { id, title: "Movie", overview: "", poster_path: null, backdrop_path: null, vote_average: 0, genres: [], runtime: 0 };
    return res.json();
  } catch {
    return { id, title: "Movie", overview: "", poster_path: null, backdrop_path: null, vote_average: 0, genres: [], runtime: 0 };
  }
}

export async function getTVDetails(id: number) {
  return tmdbFetch(`/tv/${id}`, "&append_to_response=credits,videos,similar");
}

export async function getTVSeasonDetails(tvId: number, season: number) {
  return tmdbFetch(`/tv/${tvId}/season/${season}`);
}

export async function getTVEpisodeDetails(tvId: number, season: number, episodeNumber: number) {
  return tmdbFetch(`/tv/${tvId}/season/${season}/episode/${episodeNumber}`);
}

export async function getAnime(page = 1) {
  return tmdbFetch(
    "/discover/tv",
    `&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`
  );
}

export async function getAnimeMultiPage(maxPages = 5) {
  return fetchAllPages((p) => getAnime(p), maxPages);
}

export async function getTrendingAnime() {
  const data = await tmdbFetch("/trending/tv/week");
  const filtered = (data.results || []).filter((r: any) => {
    const gids: number[] = r.genre_ids || [];
    const oc: string[] = r.origin_country || [];
    return gids.includes(16) && (oc.includes("JP") || r.original_language === "ja");
  });
  return { results: filtered.slice(0, 20), page: 1, total_pages: 1, total_results: filtered.length };
}

export async function getAnimeTopRated(page = 1) {
  return tmdbFetch(
    "/discover/tv",
    `&with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=200&page=${page}`
  );
}

export async function getAnimeTopRatedMultiPage(maxPages = 3) {
  return fetchAllPages((p) => getAnimeTopRated(p), maxPages);
}

export async function searchAnime(query: string, page = 1) {
  const [tvData, movieData] = await Promise.all([
    tmdbFetch("/search/tv", `&query=${encodeURIComponent(query)}&page=${page}`),
    tmdbFetch("/search/movie", `&query=${encodeURIComponent(query)}&page=${page}`),
  ]);
  const tvFiltered = (tvData.results || []).filter((r: any) => {
    const genreIds: number[] = r.genre_ids || [];
    const originCountry: string[] = r.origin_country || [];
    const lang = r.original_language || "";
    return genreIds.includes(16) && (originCountry.includes("JP") || lang === "ja");
  });
  const movieFiltered = (movieData.results || []).filter((r: any) => {
    const genreIds: number[] = r.genre_ids || [];
    const lang = r.original_language || "";
    return genreIds.includes(16) && lang === "ja";
  });
  const merged = [...tvFiltered, ...movieFiltered];
  return { results: merged, page: 1, total_pages: 1, total_results: merged.length };
}

export async function searchAnimeAllPages(query: string, maxPages = 5) {
  return fetchAllPages((p) => searchAnime(query, p), maxPages);
}

export const ANIME_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export async function getDiscover(page = 1) {
  return tmdbFetch(
    "/discover/movie",
    `&sort_by=popularity.desc&page=${page}`
  );
}

export async function getDiscoverMultiPage(maxPages = 5) {
  return fetchAllPages((p) => getDiscover(p), maxPages);
}

export async function discoverByGenre(mediaType: "movie" | "tv", genreId: number, page = 1, animeOnly = false) {
  const path = mediaType === "movie" ? "/discover/movie" : "/discover/tv";
  const anime = animeOnly ? "&with_original_language=ja&with_genres=16" : "";
  return tmdbFetch(path, `&with_genres=${genreId}${anime}&sort_by=popularity.desc&page=${page}`);
}

export async function discoverByGenreMultiPage(mediaType: "movie" | "tv", genreId: number, maxPages = 5, animeOnly = false) {
  return fetchAllPages((p) => discoverByGenre(mediaType, genreId, p, animeOnly), maxPages);
}

const STUDIOS = [
  { id: 420, name: "Marvel Studios" },
  { id: 3, name: "Pixar" },
  { id: 2, name: "Walt Disney Pictures" },
  { id: 174, name: "Warner Bros. Pictures" },
  { id: 33, name: "Universal Pictures" },
  { id: 4, name: "Paramount Pictures" },
  { id: 34, name: "Sony Pictures" },
  { id: 5, name: "DreamWorks Pictures" },
  { id: 7, name: "20th Century Studios" },
  { id: 12, name: "MGM" },
  { id: 14, name: "Miramax" },
  { id: 25, name: "Lionsgate" },
  { id: 41, name: "A24" },
  { id: 111, name: "Studio Ghibli" },
  { id: 923, name: "Legendary Entertainment" },
  { id: 138, name: "Focus Features" },
];

export async function getStudioContent(companyId: number, page = 1) {
  const data = await tmdbFetch(
    "/discover/movie",
    `&with_companies=${companyId}&sort_by=popularity.desc&page=${page}`
  );
  return data.results || [];
}

export async function getStudioContentAll(companyId: number, maxPages = 50) {
  return fetchAllPages((p) =>
    tmdbFetch("/discover/movie", `&with_companies=${companyId}&sort_by=popularity.desc&page=${p}`),
    maxPages
  );
}

export function getAllStudios() {
  return STUDIOS;
}

const COLLECTIONS = [
  { id: 10, name: "Star Wars" },
  { id: 1241, name: "Harry Potter" },
  { id: 119, name: "Lord of the Rings" },
  { id: 86311, name: "Marvel Cinematic Universe" },
  { id: 187646, name: "DC Universe" },
  { id: 328, name: "Jurassic Park" },
  { id: 645, name: "James Bond" },
  { id: 86, name: "Indiana Jones" },
  { id: 365, name: "Mission Impossible" },
  { id: 2344, name: "Fast & Furious" },
  { id: 3176, name: "The Matrix" },
  { id: 218, name: "Terminator" },
  { id: 112, name: "X-Men" },
  { id: 967, name: "Pirates of the Caribbean" },
  { id: 153, name: "John Wick" },
  { id: 873, name: "Alien" },
];

export async function getCollection(id: number) {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token || token === "placeholder") {
    return { name: "", parts: [] };
  }
  try {
    const res = await fetch(`${TMDB_BASE}/collection/${id}?language=en-US`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 7200 },
    });
    if (!res.ok) return { name: "", parts: [] };
    return res.json();
  } catch {
    return { name: "", parts: [] };
  }
}

export function getAllCollections() {
  return COLLECTIONS;
}

export async function searchMovies(query: string) {
  return tmdbFetch("/search/movie", `&query=${encodeURIComponent(query)}`);
}

export async function getCompany(id: number) {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token || token === "placeholder") return { id, name: "", logo_path: null };
  try {
    const res = await fetch(`${TMDB_BASE}/company/${id}?language=en-US`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { id, name: "", logo_path: null };
    return res.json();
  } catch {
    return { id, name: "", logo_path: null };
  }
}

export async function getCompanyMovies(companyId: number, page = 1) {
  return tmdbFetch(
    "/discover/movie",
    `&with_companies=${companyId}&sort_by=popularity.desc&page=${page}`
  );
}

export async function getCompanyMoviesAll(companyId: number, maxPages = 50) {
  return fetchAllPages((p) => getCompanyMovies(companyId, p), maxPages);
}
