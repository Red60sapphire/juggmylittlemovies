"use client";

const WATCHLIST_KEY = "streamr_watchlist";
const HISTORY_KEY = "streamr_history";

export interface LocalWatchlistItem {
  movie_id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  added_at: string;
}

export interface LocalHistoryItem {
  movie_id: number;
  title: string;
  poster_path: string | null;
  progress: number;
  duration: number;
  watched_at: string;
  media_type?: "movie" | "tv" | "anime" | "live";
}

function getItem<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function getLocalWatchlist(): LocalWatchlistItem[] {
  return getItem<LocalWatchlistItem>(WATCHLIST_KEY);
}

export function addToLocalWatchlist(item: Omit<LocalWatchlistItem, "added_at">): boolean {
  const list = getLocalWatchlist();
  if (list.some((i) => i.movie_id === item.movie_id)) {
    removeFromLocalWatchlist(item.movie_id);
    return false;
  }
  list.unshift({ ...item, added_at: new Date().toISOString() });
  setItem(WATCHLIST_KEY, list);
  return true;
}

export function removeFromLocalWatchlist(movieId: number) {
  setItem(
    WATCHLIST_KEY,
    getLocalWatchlist().filter((i) => i.movie_id !== movieId)
  );
}

export function isInLocalWatchlist(movieId: number): boolean {
  return getLocalWatchlist().some((i) => i.movie_id === movieId);
}

export function getLocalHistory(): LocalHistoryItem[] {
  return getItem<LocalHistoryItem>(HISTORY_KEY);
}

export function addToLocalHistory(item: Omit<LocalHistoryItem, "watched_at">) {
  const list = getLocalHistory().filter((i) => i.movie_id !== item.movie_id);
  list.unshift({ ...item, watched_at: new Date().toISOString() });
  setItem(HISTORY_KEY, list);
}

export function clearLocalHistory() {
  setItem(HISTORY_KEY, []);
}
