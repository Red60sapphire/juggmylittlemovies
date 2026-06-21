"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { getImageUrl } from "@/lib/utils";
import type { Movie } from "@/types";
import { Search, TrendingUp } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Movie[]>([]);
  const [backdrops, setBackdrops] = useState<Movie[]>([]);
  const [activeBackdrop, setActiveBackdrop] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || []))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    fetch("/api/tmdb/trending")
      .then((r) => r.json())
      .then((data) => setBackdrops((data.results || []).filter((item: Movie) => item.backdrop_path).slice(0, 6)))
      .catch(() => setBackdrops([]));
  }, []);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const id = setInterval(() => setActiveBackdrop((current) => (current + 1) % backdrops.length), 5500);
    return () => clearInterval(id);
  }, [backdrops.length]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative -mx-4 -mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111117] px-5 py-14 md:-mx-2 md:px-8">
        {backdrops.map((movie, index) => (
          <img
            key={movie.id}
            src={getImageUrl(movie.backdrop_path, "original") || ""}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeBackdrop ? "opacity-30" : "opacity-0"}`}
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
        </div>
      </section>

      {/* Results */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-xl font-bold text-white">
            {query ? `Results for "${query}"` : "Trending Now"}
          </h2>
          {results.length > 0 && (
            <span className="text-sm text-white/35">{results.length} found</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        ) : query ? (
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
            <Link href="/trending" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all">
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
