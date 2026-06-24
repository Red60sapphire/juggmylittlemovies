"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { MOVIE_GENRES } from "@/lib/tmdb";
import { ArrowUpRight, Film, TrendingUp, Star, Sparkles } from "lucide-react";
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

const VIBRANT_GENRE_COLORS: Record<string, string> = {
  Action: "from-red-600/20 via-red-800/10 to-transparent",
  Adventure: "from-amber-600/20 via-amber-800/10 to-transparent",
  Animation: "from-blue-600/20 via-blue-800/10 to-transparent",
  Comedy: "from-yellow-600/20 via-yellow-800/10 to-transparent",
  Crime: "from-slate-600/20 via-slate-800/10 to-transparent",
  Documentary: "from-emerald-600/20 via-emerald-800/10 to-transparent",
  Drama: "from-violet-600/20 via-violet-800/10 to-transparent",
  Family: "from-pink-600/20 via-pink-800/10 to-transparent",
  Fantasy: "from-purple-600/20 via-purple-800/10 to-transparent",
  Horror: "from-rose-900/30 via-rose-800/10 to-transparent",
  Mystery: "from-indigo-600/20 via-indigo-800/10 to-transparent",
  Romance: "from-pink-500/20 via-pink-700/10 to-transparent",
  "Sci-Fi": "from-cyan-600/20 via-cyan-800/10 to-transparent",
  Thriller: "from-orange-600/20 via-orange-800/10 to-transparent",
};

export default function MoviesPage() {
  const [trending, setTrending] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/tmdb/trending?all=true")
      .then((r) => r.json())
      .then((d) => setTrending(d.results?.slice(0, 20) || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-0.5 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-1 h-6 bg-accent rounded-full" />
        <Film className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold text-white tracking-tight">Movies</h1>
        <Sparkles className="w-4 h-4 text-yellow-400/60" />
      </motion.div>

      {/* Trending row */}
      {trending.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <HorizontalSlider
            title="Trending Movies"
            items={trending}
            renderCard={(movie, i) => <MovieCard movie={movie} index={i} />}
          />
        </motion.div>
      )}

      {/* Genre rows with vibrant headers */}
      <div className="space-y-0.5">
        {MOVIE_GENRES.map((genre) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
          >
            <GenreRow genreId={genre.id} genreName={genre.name} />
          </motion.div>
        ))}
      </div>

      <div className="mx-3 my-6 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* Genre grid */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <TrendingUp className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-bold text-white tracking-tight">Browse by Genre</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MOVIE_GENRES.map((genre) => (
            <Link
              key={genre.id}
              href={`/search?genre=${genre.id}&type=movie`}
              className="group relative overflow-hidden rounded-xl bg-white/[0.02] border border-border hover:border-accent/40 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${VIBRANT_GENRE_COLORS[genre.name] || "from-accent/10 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-semibold text-white/50 group-hover:text-white transition-colors">
                  {genre.name}
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/15 group-hover:text-accent transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
