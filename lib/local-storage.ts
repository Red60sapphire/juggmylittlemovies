const WATCHLIST_KEY = "juggmylittlemovies_watchlist";

export function isInLocalWatchlist(movie_id: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw);
    return list.some((item: any) => item.movie_id === movie_id);
  } catch {
    return false;
  }
}

export function addToLocalWatchlist(item: {
  movie_id: number;
  title: string;
  poster_path: string | null;
  vote_average?: number;
}): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    let list: any[] = raw ? JSON.parse(raw) : [];
    const existing = list.findIndex((i) => i.movie_id === item.movie_id);
    if (existing >= 0) {
      list.splice(existing, 1);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
      return false;
    }
    list.unshift(item);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}
