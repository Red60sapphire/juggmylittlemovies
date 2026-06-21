"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { MOVIE_GENRES } from "@/lib/tmdb";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

function GenreRow({ genreId, genreName }: { genreId: number; genreName: string }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tmdb/genre?type=movie&id=${genreId}&all=true`)
      .then((r) => r.json())
      .then((data) => setMovies(data.results || []))
      .finally(() => setLoading(false));
  }, [genreId]);

  if (loading) return null;
  if (!movies.length) return null;

  return (
    <HorizontalSlider
      title={genreName}
      items={movies}
      renderCard={(movie, i) => <MovieCard movie={movie} index={i} />}
    />
  );
}

export default function MoviesPage() {
  return (
    <div className="space-y-0.5 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-0.5 h-5 bg-accent rounded-full" />
        <h1 className="text-xl font-bold text-white tracking-tight">Movies</h1>
      </div>

      <div className="space-y-0.5">
        {MOVIE_GENRES.map((genre) => (
          <div key={genre.id}>
            <GenreRow genreId={genre.id} genreName={genre.name} />
          </div>
        ))}
      </div>

      <div className="mx-3 my-4 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-0.5 h-4 bg-accent rounded-full" />
          <h2 className="text-base font-bold text-white tracking-tight">All Genres</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {MOVIE_GENRES.map((genre) => (
            <Link
              key={genre.id}
              href={`/search?genre=${genre.id}&type=movie`}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-border hover:border-accent/30 hover:bg-accent-muted transition-all group"
            >
              <span className="text-sm font-medium text-muted group-hover:text-white transition-colors">
                {genre.name}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
