"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { Search, Ghost, ChevronLeft, ChevronRight } from "lucide-react";

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
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollRow = (key: string, dir: "left" | "right") => {
    const el = rowRefs.current.get(key);
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-accent rounded-full" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Anime</h1>
          {!loading && movies.length > 0 && (
            <span className="text-sm text-white/40">{movies.length} titles</span>
          )}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anime..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <div
            ref={(el) => { if (el) rowRefs.current.set("all", el); }}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {movies.map((movie, i) => (
              <div key={movie.id} className="flex-shrink-0 w-[180px] sm:w-[160px]">
                <MovieCard movie={movie} index={i} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 justify-end mt-1">
            <button
              onClick={() => scrollRow("all", "left")}
              className="p-2 rounded-lg bg-white/5 hover:bg-accent/80 text-white/50 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollRow("all", "right")}
              className="p-2 rounded-lg bg-white/5 hover:bg-accent/80 text-white/50 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] rounded-2xl border border-white/[0.06] bg-[#121218]">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Ghost className="w-7 h-7 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white/70">No anime found</h3>
          <p className="text-sm text-white/40 mt-1">
            {debouncedSearch ? `No results for "${debouncedSearch}"` : "No titles available"}
          </p>
        </div>
      )}
    </div>
  );
}
