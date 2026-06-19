const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch(path: string, params = "") {
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

export async function getTrending() {
  return tmdbFetch("/trending/all/week");
}

export async function getPopular() {
  return tmdbFetch("/movie/popular");
}

export async function getTopRated() {
  return tmdbFetch("/movie/top_rated");
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

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch(
    "/search/multi",
    `&query=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function searchCollection(query: string) {
  const data = await tmdbFetch(
    "/search/movie",
    `&query=${encodeURIComponent(query)}&page=1`
  );
  return data.results || [];
}

export async function getMovieDetails(id: number) {
  return tmdbFetch(`/movie/${id}`, "&append_to_response=credits,videos,similar");
}

export async function getTVDetails(id: number) {
  return tmdbFetch(`/tv/${id}`, "&append_to_response=credits,videos,similar,season_number");
}

export async function getAnime(page = 1) {
  return tmdbFetch(
    "/discover/tv",
    `&with_keywords=210024&include_adult=false&certification_country=US&certification.lte=TV-14&sort_by=popularity.desc&page=${page}`
  );
}

export async function getAnimeTopRated(page = 1) {
  return tmdbFetch(
    "/discover/tv",
    `&with_keywords=210024&include_adult=false&certification_country=US&certification.lte=TV-14&sort_by=vote_average.desc&vote_count.gte=200&page=${page}`
  );
}

export async function getAnimeAiring(page = 1) {
  const year = new Date().getFullYear();
  return tmdbFetch(
    "/discover/tv",
    `&with_keywords=210024&include_adult=false&certification_country=US&certification.lte=TV-14&sort_by=popularity.desc&first_air_date.gte=${year-2}-01-01&page=${page}`
  );
}

export async function getAnimeMovies(page = 1) {
  return tmdbFetch(
    "/discover/movie",
    `&with_keywords=210024&include_adult=false&certification_country=US&certification.lte=PG-13&sort_by=popularity.desc&page=${page}`
  );
}

export async function getDiscover(page = 1) {
  return tmdbFetch(
    "/discover/movie",
    `&sort_by=popularity.desc&page=${page}`
  );
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

export async function getStudioContent(companyId: number) {
  const data = await tmdbFetch(
    "/discover/movie",
    `&with_companies=${companyId}&sort_by=popularity.desc&page=1`
  );
  return data.results || [];
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

export async function getTVDiscover(page = 1) {
  return tmdbFetch(
    "/discover/tv",
    `&sort_by=popularity.desc&page=${page}`
  );
}

export async function getMoviesByGenre(genreId: number, page = 1) {
  return tmdbFetch(
    "/discover/movie",
    `&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
  );
}

export async function getTVByGenre(genreId: number, page = 1) {
  return tmdbFetch(
    "/discover/tv",
    `&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
  );
}
