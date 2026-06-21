"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { Search, Ghost } from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AnimePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    setLoading(true);
    const params = debouncedSearch
      ? `q=${encodeURIComponent(debouncedSearch)}&all=true`
      : "all=true";
    fetch(`/api/tmdb/anime?${params}`)
      .then((r) => r.json())
      .then((data) => setMovies(data.results || []))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-5 bg-accent rounded-full" />
          <h1 className="text-xl font-bold text-white tracking-tight">Anime</h1>
          {!loading && movies.length > 0 && (
            <span className="text-xs text-muted">{movies.length} titles</span>
          )}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anime..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-border rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <HorizontalSlider
          title={debouncedSearch ? `Results for "${debouncedSearch}"` : "Browse Anime"}
          items={movies}
          renderCard={(movie, i) => <MovieCard movie={movie} index={i} />}
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] rounded-xl border border-border bg-surface">
          <div className="w-14 h-14 rounded-xl bg-white/[0.03] flex items-center justify-center mb-3">
            <Ghost className="w-6 h-6 text-white/15" />
          </div>
          <h3 className="text-base font-semibold text-white/70">No anime found</h3>
          <p className="text-sm text-muted mt-0.5">
            {debouncedSearch ? `No results for "${debouncedSearch}"` : "No titles available"}
          </p>
        </div>
      )}
    </div>
  );
}
