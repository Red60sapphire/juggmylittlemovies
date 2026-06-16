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
