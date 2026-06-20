"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { getImageUrl } from "@/lib/utils";
import type { Movie } from "@/types";
import { Search } from "lucide-react";

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
    <div className="space-y-8">
      <section className="relative -mx-4 -mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111117] px-5 py-14 md:-mx-2 md:px-8">
        {backdrops.map((movie, index) => (
          <img
            key={movie.id}
            src={getImageUrl(movie.backdrop_path, "original") || ""}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeBackdrop ? "opacity-45" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090d] via-[#09090d]/80 to-[#09090d]/35" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold text-accent">Search All Content</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
            Find your next movie night.
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/60 md:text-base">
            Search movies, shows, anime, and trending titles across juggmylittlemovies.
          </p>
        </div>
      </section>

      <h2 className="text-2xl font-bold text-white">
        Search Results{query && ` for "${query}"`}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center justify-center h-40 text-white/40">
          <Search className="w-12 h-12 mb-3" />
          <p>No results found</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-white/40">
          <Search className="w-12 h-12 mb-3" />
          <p>Search for movies and TV shows</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
