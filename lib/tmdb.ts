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
