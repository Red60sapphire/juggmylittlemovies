"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl, formatRating } from "@/lib/utils";
import type { Movie } from "@/types";
import {
  Search,
  X,
  TrendingUp,
  Play,
  Star,
  Sparkles,
  Clock,
} from "lucide-react";

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-white/[0.04] mb-2" />
      <div className="h-4 bg-white/[0.04] rounded w-3/4 mb-1" />
      <div className="h-3 bg-white/[0.04] rounded w-1/2" />
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get("q") || "";

  const [input, setInput] = useState(urlQuery);
  const [results, setResults] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!urlQuery) {
      setResults([]);
      fetch("/api/tmdb/trending")
        .then((r) => r.json())
        .then((data) => setTrending(data.results || []))
        .catch(() => {});
      return;
    }
    setInput(urlQuery);
    doSearch(urlQuery);
  }, [urlQuery]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(() => {
        router.replace(`/search?q=${encodeURIComponent(val.trim())}`, { scroll: false });
      }, 400);
    } else {
      router.replace("/search", { scroll: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const searches = [input.trim(), ...recentSearches.filter((s) => s !== input.trim())].slice(
        0, 8
      );
      setRecentSearches(searches);
      localStorage.setItem("recentSearches", JSON.stringify(searches));
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  const clearSearch = () => {
    setInput("");
    setResults([]);
    router.push("/search");
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasQuery = !!urlQuery;
  const showTrending = !hasQuery && trending.length > 0;

  return (
    <main id="main-content">
      <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="relative px-6 pt-12 pb-16 md:pt-20 md:pb-24 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-white/50 mb-6">
              <Sparkles className="w-3 h-3" />
              Discover millions of movies and TV shows
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight">
              Search <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">All Content</span>
            </h1>
            <p className="text-white/40 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Find your next favorite movie or binge-worthy series
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            ref={searchRef}
            className="max-w-2xl mx-auto relative"
          >
            <form onSubmit={handleSubmit}>
              <div
                className={`relative flex items-center gap-3 bg-[#0a0a12] border rounded-2xl px-5 py-3.5 transition-all duration-300 ${
                  focused
                    ? "border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/20"
                    : "border-white/[0.08] hover:border-white/20"
                }`}
              >
                <Search className={`w-5 h-5 flex-shrink-0 transition-colors ${focused ? "text-purple-400" : "text-white/30"}`} />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onFocus={() => setFocused(true)}
                  placeholder="Search movies, TV shows, genres..."
                  className="flex-1 bg-transparent text-white text-lg placeholder:text-white/20 focus:outline-none"
                />
                {input && (
                  <button type="button" onClick={clearSearch} className="text-white/30 hover:text-white/60 p-1">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[11px] text-white/20 border border-white/[0.06] rounded-lg font-mono bg-white/[0.02]">
                  <span>⌘</span>K
                </kbd>
              </div>
            </form>

            <AnimatePresence>
              {focused && !input.trim() && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-[#0a0a12] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50 p-3"
                >
                  <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-white/30 uppercase tracking-wider font-semibold">
                    <Clock className="w-3 h-3" />
                    Recent Searches
                  </div>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        router.push(`/search?q=${encodeURIComponent(s)}`);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/[0.04] hover:text-white transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-white/20" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="px-1">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/40">
                <span className="text-white/70 font-medium">{results.length}</span> result
                {results.length !== 1 ? "s" : ""} for &ldquo;{urlQuery}&rdquo;
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((movie, i) => (
                <SearchResultCard key={movie.id} movie={movie} index={i} />
              ))}
            </div>
          </motion.div>
        ) : hasQuery ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-white/30 gap-4"
          >
            <Search className="w-16 h-16" />
            <p className="text-lg">No results for &ldquo;{urlQuery}&rdquo;</p>
            <p className="text-sm text-white/20">Try different keywords or browse trending</p>
            <button
              onClick={() => {
                setInput("");
                router.push("/search");
              }}
              className="mt-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-sm text-white/60 transition-colors"
            >
              Browse Trending
            </button>
          </motion.div>
        ) : showTrending ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Trending Now</h2>
              <p className="text-xs text-white/30 ml-auto">This week</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trending.map((movie, i) => (
                <SearchResultCard key={movie.id} movie={movie} index={i} trending />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-white/30 gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-lg">Type to start searching</p>
            <div className="flex items-center gap-2 text-sm text-white/20">
              <kbd className="px-2 py-0.5 border border-white/[0.08] rounded text-xs">⌘K</kbd>
              <span>to focus search</span>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function SearchResultCard({ movie, index, trending }: { movie: Movie; index: number; trending?: boolean }) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const mediaType = movie.media_type || (movie.title ? "movie" : "tv");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.025 }}
    >
      <Link
        href={mediaType === "tv" ? `/watch/tv/${movie.id}/1/1` : `/watch/movie/${movie.id}`}
        className="group block"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#16161a] mb-2 shadow-lg ring-1 ring-white/[0.04] transition-all duration-300 group-hover:ring-accent/30 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-purple-500/5">
          {movie.poster_path ? (
            <img
              src={getImageUrl(movie.poster_path, "w342")}
              alt={title}
              loading={index < 8 ? "eager" : "lazy"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
              <Play className="w-10 h-10 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-accent shadow-lg shadow-accent/30 flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-black ml-0.5" />
            </div>
          </div>

          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm ${
              mediaType === "tv"
                ? "bg-blue-500/70 text-white"
                : "bg-purple-500/70 text-white"
            }`}>
              {mediaType === "tv" ? "TV" : "Movie"}
            </span>
            {year && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/70">
                {year}
              </span>
            )}
          </div>

          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-bold text-yellow-400 flex items-center gap-0.5 shadow-sm">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {formatRating(movie.vote_average)}
          </div>
        </div>
        <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate px-0.5">
          {title}
        </h3>
      </Link>
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-white/30">Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
