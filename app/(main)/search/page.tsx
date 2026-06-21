"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { getImageUrl, cn } from "@/lib/utils";
import type { Movie } from "@/types";
import { SIMPLE_GENRES } from "@/lib/tmdb";
import {
  Search, TrendingUp, Film, Tv, Ghost, Loader2, SlidersHorizontal, X, Star, Calendar,
  ArrowUpDown, Check, Filter,
} from "lucide-react";
import Link from "next/link";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface SearchFilters {
  yearFrom: string;
  yearTo: string;
  genres: number[];
  minRating: string;
  mediaType: string;
  sortBy: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  yearFrom: "",
  yearTo: "",
  genres: [],
  minRating: "",
  mediaType: "",
  sortBy: "popularity",
};

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
  { value: "az", label: "A–Z" },
];

const MEDIA_OPTIONS = [
  { value: "", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "anime", label: "Anime" },
];

function FilterPanel({
  filters, onChange, onApply, onClear, total,
}: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onApply: () => void;
  onClear: () => void;
  total: number;
}) {
  const toggleGenre = (id: number) => {
    const next = filters.genres.includes(id)
      ? filters.genres.filter((g) => g !== id)
      : [...filters.genres, id];
    onChange({ ...filters, genres: next });
  };

  const activeCount = [filters.yearFrom, filters.yearTo, filters.minRating, filters.mediaType]
    .filter(Boolean).length + (filters.genres.length > 0 ? 1 : 0);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-white">Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-accent text-white rounded-full">{activeCount}</span>
          )}
        </div>
        <button onClick={onClear} className="text-xs text-muted hover:text-white transition-colors">Clear</button>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1.5">Media Type</label>
        <div className="flex gap-1.5 flex-wrap">
          {MEDIA_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, mediaType: opt.value })}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                filters.mediaType === opt.value
                  ? "bg-accent text-white"
                  : "bg-white/[0.04] text-muted hover:text-white hover:bg-white/[0.08]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted block mb-1">Year from</label>
          <input
            type="number"
            value={filters.yearFrom}
            onChange={(e) => onChange({ ...filters, yearFrom: e.target.value })}
            placeholder="2000"
            className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-border rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Year to</label>
          <input
            type="number"
            value={filters.yearTo}
            onChange={(e) => onChange({ ...filters, yearTo: e.target.value })}
            placeholder="2026"
            className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-border rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1">Min. Rating</label>
        <div className="flex gap-1.5 flex-wrap">
          {["5", "6", "7", "8", "9"].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? "" : r })}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                filters.minRating === r
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-white/[0.04] text-muted hover:text-white hover:bg-white/[0.08]"
              )}
            >
              <Star className="w-3 h-3" />{r}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1">Sort by</label>
        <div className="flex gap-1.5 flex-wrap">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, sortBy: opt.value })}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                filters.sortBy === opt.value
                  ? "bg-accent text-white"
                  : "bg-white/[0.04] text-muted hover:text-white hover:bg-white/[0.08]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1.5">Genres</label>
        <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto scrollbar-hide">
          {SIMPLE_GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                filters.genres.includes(g.id)
                  ? "bg-accent/15 text-accent border-accent/30"
                  : "bg-white/[0.04] text-muted border-transparent hover:text-white hover:bg-white/[0.08]"
              )}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onApply}
        className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98]"
      >
        Apply Filters
        {total > 0 && <span className="ml-1.5 text-white/60">({total})</span>}
      </button>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<Movie[]>([]);
  const [backdrops, setBackdrops] = useState<Movie[]>([]);
  const [activeBackdrop, setActiveBackdrop] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const debouncedInput = useDebounce(inputValue, 350);
  const initialLoadDone = useRef(false);

  const buildSearchUrl = useCallback((q: string, f: SearchFilters) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (f.yearFrom) params.set("yearFrom", f.yearFrom);
    if (f.yearTo) params.set("yearTo", f.yearTo);
    if (f.genres.length) params.set("genres", f.genres.join(","));
    if (f.minRating) params.set("minRating", f.minRating);
    if (f.mediaType) params.set("mediaType", f.mediaType);
    if (f.sortBy && f.sortBy !== "popularity") params.set("sortBy", f.sortBy);
    return `/api/tmdb/search?all=true&${params.toString()}`;
  }, []);

  useEffect(() => {
    setLoading(true);
    const effectiveQuery = query || debouncedInput;
    const f = appliedFilters;

    if (effectiveQuery || f.mediaType || f.genres.length) {
      const url = buildSearchUrl(effectiveQuery, f);
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          let res = data.results || [];
          if (f.minRating) {
            const min = parseFloat(f.minRating);
            res = res.filter((m: Movie) => (m.vote_average || 0) >= min);
          }
          if (f.sortBy === "newest") {
            res.sort((a: Movie, b: Movie) => {
              const da = (a.release_date || a.first_air_date || "");
              const db = (b.release_date || b.first_air_date || "");
              return db.localeCompare(da);
            });
          } else if (f.sortBy === "rating") {
            res.sort((a: Movie, b: Movie) => (b.vote_average || 0) - (a.vote_average || 0));
          } else if (f.sortBy === "az") {
            res.sort((a: Movie, b: Movie) => (a.title || a.name || "").localeCompare(b.title || b.name || ""));
          }
          setResults(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch("/api/tmdb/trending")
        .then((r) => r.json())
        .then((data) => setResults((data.results || []).slice(0, 20)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }
  }, [debouncedInput, appliedFilters, query]);

  useEffect(() => {
    if (appliedFilters.mediaType || appliedFilters.genres.length) return;
    fetch("/api/tmdb/trending")
      .then((r) => r.json())
      .then((data) =>
        setBackdrops(
          (data.results || [])
            .filter((item: Movie) => item.backdrop_path)
            .slice(0, 6)
        )
      )
      .catch(() => setBackdrops([]));
  }, []);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const id = setInterval(
      () => setActiveBackdrop((current) => (current + 1) % backdrops.length),
      5500
    );
    return () => clearInterval(id);
  }, [backdrops.length]);

  useEffect(() => {
    if (initialLoadDone.current) return;
    if (query) setInputValue(query);
    initialLoadDone.current = true;
  }, [query]);

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = appliedFilters.yearFrom || appliedFilters.yearTo ||
    appliedFilters.genres.length > 0 || appliedFilters.minRating ||
    appliedFilters.mediaType || appliedFilters.sortBy !== "popularity";

  const movieResults = results.filter(
    (r) => r.media_type === "movie" || (!r.media_type && appliedFilters.mediaType !== "tv")
  );
  const tvResults = results.filter(
    (r) => r.media_type === "tv" || (!r.media_type && appliedFilters.mediaType === "tv")
  );
  const showTypeSections = !appliedFilters.mediaType && (debouncedInput || query).length > 0 && !hasActiveFilters;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <section className="relative -mx-4 -mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111117] px-5 py-12 md:-mx-2 md:px-8">
        {backdrops.map((movie, index) => (
          <img
            key={movie.id}
            src={getImageUrl(movie.backdrop_path, "original") || ""}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === activeBackdrop ? "opacity-25" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-accent">Browse & Discover</p>
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  showFilters || hasActiveFilters
                    ? "bg-accent/15 border-accent/30 text-accent"
                    : "bg-white/[0.04] border-border text-muted hover:text-white hover:bg-white/[0.08]"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </button>
            </div>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
            Find your next watch.
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-lg">
            Search movies, TV shows, and trending titles across the library.
          </p>
          <div className="mt-4 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search movies, TV shows, anime..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onApply={applyFilters}
          onClear={clearFilters}
          total={results.length}
        />
      )}

      {/* Results */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-lg font-bold text-white">
            {(query || debouncedInput || hasActiveFilters)
              ? `Results`
              : "Trending Now"}
          </h2>
          {!loading && results.length > 0 && (
            <span className="text-sm text-white/35">{results.length} found</span>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-muted hover:text-white ml-auto flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-8">
            {showTypeSections && movieResults.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Film className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Movies</h3>
                  <span className="text-xs text-white/30">{movieResults.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-vis-auto">
                  {movieResults.map((movie, i) => (
                    <MovieCard key={`m-${movie.id}`} movie={movie} index={i} />
                  ))}
                </div>
              </div>
            )}
            {showTypeSections && tvResults.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">TV Shows</h3>
                  <span className="text-xs text-white/30">{tvResults.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-vis-auto">
                  {tvResults.map((movie, i) => (
                    <MovieCard key={`tv-${movie.id}`} movie={movie} index={i} />
                  ))}
                </div>
              </div>
            )}
            {!showTypeSections && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-vis-auto">
                {results.map((movie, i) => (
                  <div key={movie.id} className="relative">
                    <MovieCard movie={movie} index={i} />
                    {movie.media_type && (
                      <span className={cn(
                        "absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                        movie.media_type === "movie" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                      )}>
                        {movie.media_type === "movie" ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                        <span className="capitalize">{movie.media_type}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (query || debouncedInput || hasActiveFilters) ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] rounded-2xl border border-white/[0.06] bg-[#121218]">
            <Search className="w-8 h-8 text-white/20 mb-3" />
            <h3 className="text-base font-semibold text-white/70">No results found</h3>
            <p className="text-sm text-white/40 mt-1">Try different search terms or filters</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[30vh] rounded-2xl border border-white/[0.06] bg-[#121218]">
            <TrendingUp className="w-8 h-8 text-white/20 mb-3" />
            <h3 className="text-base font-semibold text-white/70">Search to discover</h3>
            <p className="text-sm text-white/40 mt-1 mb-5">Find movies and TV shows by title</p>
            <Link
              href="/trending"
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all"
            >
              Browse Trending
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
