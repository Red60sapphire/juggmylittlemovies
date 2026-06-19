import type { WatchHistory } from "@/types";

const STORAGE_KEY = "zynema_history";

export function getLocalHistory(): WatchHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addToLocalHistory(
  movie_id: number,
  title: string,
  poster_path: string | null,
  backdrop_path: string | null,
  progress = 0,
  duration = 0
) {
  const history = getLocalHistory();
  const existing = history.findIndex((h) => h.movie_id === movie_id);

  const entry: WatchHistory = {
    id: `local-${movie_id}-${Date.now()}`,
    movie_id,
    title,
    poster_path,
    progress,
    duration,
    watched_at: new Date().toISOString(),
  };

  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.unshift(entry);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function removeFromLocalHistory(movie_id: number) {
  const history = getLocalHistory().filter((h) => h.movie_id !== movie_id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function updateLocalProgress(movie_id: number, progress: number, duration: number) {
  const history = getLocalHistory();
  const entry = history.find((h) => h.movie_id === movie_id);
  if (entry) {
    entry.progress = progress;
    entry.duration = duration;
    entry.watched_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function clearLocalHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
