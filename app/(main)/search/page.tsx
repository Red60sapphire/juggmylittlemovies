"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { getImageUrl } from "@/lib/utils";
import type { Movie } from "@/types";
import { Search, TrendingUp, Film, Tv, Ghost, Loader2 } from "lucide-react";
import Link from "next/link";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface SearchResult extends Movie {
  media_type?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const genreParam = searchParams.get("genre") || "";
  const typeParam = searchParams.get("type") || "";

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [backdrops, setBackdrops] = useState<Movie[]>([]);
  const [activeBackdrop, setActiveBackdrop] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const debouncedInput = useDebounce(inputValue, 350);
  const initialLoadDone = useRef(false);

  const effectiveQuery = query || debouncedInput;

  useEffect(() => {
    if (!genreParam || !typeParam) return;
    fetch(`/api/tmdb/genre?type=${typeParam}&id=${genreParam}&all=true`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results || []);
        setTotalCount(data.total_results || 0);
      });
  }, [genreParam, typeParam]);

  useEffect(() => {
    if (!effectiveQuery || genreParam) return;
    setLoading(true);
    fetch(`/api/tmdb/search?q=${encodeURIComponent(effectiveQuery)}&all=true`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results || []);
        setTotalCount(data.total_results || 0);
      })
      .finally(() => setLoading(false));
  }, [effectiveQuery, genreParam]);

  useEffect(() => {
    if (genreParam) return;
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
  }, [genreParam]);

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

  const mediaIcon = (type?: string) => {
    switch (type) {
      case "movie":
        return <Film className="w-3 h-3" />;
      case "tv":
        return <Tv className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const mediaColor = (type?: string) => {
    switch (type) {
      case "movie":
        return "bg-blue-500/20 text-blue-400";
      case "tv":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-purple-500/20 text-purple-400";
    }
  };

  const movieResults = results.filter((r) => r.media_type === "movie" || (!r.media_type && typeParam !== "tv"));
  const tvResults = results.filter((r) => r.media_type === "tv" || (!r.media_type && typeParam === "tv"));

  const showTypeSections = !genreParam && effectiveQuery.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative -mx-4 -mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111117] px-5 py-14 md:-mx-2 md:px-8">
        {backdrops.map((movie, index) => (
          <img
            key={movie.id}
            src={getImageUrl(movie.backdrop_path, "original") || ""}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === activeBackdrop ? "opacity-30" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold text-accent">Browse All Content</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
            Find your next watch.
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/50 md:text-base max-w-lg">
            Search movies, TV shows, and trending titles across the library.
          </p>
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search movies, TV shows, anime..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>
      </section>

      {/* Results */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-xl font-bold text-white">
            {effectiveQuery
              ? `Results for "${effectiveQuery}"`
              : genreParam
              ? `${results[0]?.genre_ids?.length ? "Genre" : "Browse"}`
              : "Trending Now"}
          </h2>
          {results.length > 0 && !loading && (
            <span className="text-sm text-white/35">
              {totalCount || results.length} found
            </span>
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
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Movies</h3>
                  <span className="text-xs text-white/30">{movieResults.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movieResults.map((movie, i) => (
                    <MovieCard key={`m-${movie.id}`} movie={movie} index={i} />
                  ))}
                </div>
              </div>
            )}

            {showTypeSections && tvResults.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tv className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">TV Shows</h3>
                  <span className="text-xs text-white/30">{tvResults.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tvResults.map((movie, i) => (
                    <MovieCard key={`tv-${movie.id}`} movie={movie} index={i} />
                  ))}
                </div>
              </div>
            )}

            {!showTypeSections && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((movie, i) => (
                  <div key={movie.id} className="relative">
                    <MovieCard movie={movie} index={i} />
                    {movie.media_type && (
                      <span
                        className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${mediaColor(
                          movie.media_type
                        )}`}
                      >
                        {mediaIcon(movie.media_type)}
                        <span className="capitalize">{movie.media_type}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : effectiveQuery ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] rounded-2xl border border-white/[0.06] bg-[#121218]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white/70">No results found</h3>
            <p className="text-sm text-white/40 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[30vh] rounded-2xl border border-white/[0.06] bg-[#121218]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white/70">Search to discover</h3>
            <p className="text-sm text-white/40 mt-1 mb-6">Find movies and TV shows by title</p>
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
