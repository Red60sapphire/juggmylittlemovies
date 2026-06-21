"use client";

import { useState, useEffect, useRef } from "react";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { TV_GENRES } from "@/lib/tmdb";
import { Tv, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

function GenreRow({ genreId, genreName }: { genreId: number; genreName: string }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/tmdb/genre?type=tv&id=${genreId}&all=true`)
      .then((r) => r.json())
      .then((data) => setMovies(data.results || []))
      .finally(() => setLoading(false));
  }, [genreId]);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (loading) return null;
  if (!movies.length) return null;

  return (
    <section className="mb-8 md:mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-xl md:text-base font-bold text-white tracking-tight">{genreName}</h2>
          <span className="text-xs text-white/35">{movies.length} titles</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 md:p-1.5 rounded-lg bg-white/[0.06] hover:bg-accent/80 text-white/50 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 md:p-1.5 rounded-lg bg-white/[0.06] hover:bg-accent/80 text-white/50 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-4 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie, i) => (
          <MovieCard key={`${genreId}-${movie.id}`} movie={movie} index={i} />
        ))}
      </div>
    </section>
  );
}

function seeAllGenresRow() {
  return (
    <section className="mb-8 md:mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-xl md:text-base font-bold text-white tracking-tight">All Genres</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {TV_GENRES.map((genre) => (
          <Link
            key={genre.id}
            href={`/search?genre=${genre.id}&type=tv`}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-accent/30 transition-all group"
          >
            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
              {genre.name}
            </span>
            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function TVShowsPage() {
  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-accent rounded-full" />
        <h1 className="text-2xl font-bold text-white tracking-tight">TV Shows</h1>
      </div>

      <div className="space-y-2">
        {TV_GENRES.map((genre, i) => (
          <div key={genre.id}>
            <GenreRow genreId={genre.id} genreName={genre.name} />
            {i < TV_GENRES.length - 1 && (
              <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            )}
          </div>
        ))}
      </div>

      <div className="mx-3 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {seeAllGenresRow()}
    </div>
  );
}
