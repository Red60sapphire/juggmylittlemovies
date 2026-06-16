"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl, getBackdropUrl, formatRating, formatDate } from "@/lib/utils";
import type { Movie } from "@/types";
import { Play, Info, Star, Plus, Clock, Calendar } from "lucide-react";

interface Props {
  movies: Movie[];
}

export default function HeroBanner({ movies }: Props) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const movie = movies[current];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 7000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movie || !mounted) {
    return (
      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] rounded-2xl overflow-hidden bg-card animate-shimmer" />
    );
  }

  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const genres = movie.genre_ids?.slice(0, 3) || [];

  const genreNames: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western",
  };

  return (
    <section className="relative w-full h-[75vh] min-h-[500px] max-h-[850px] overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        {movies.slice(0, 5).map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ pointerEvents: i === current ? "auto" : "none" }}
          >
            <img
              src={getBackdropUrl(m.backdrop_path) || ""}
              alt={m.title || m.name || ""}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />

      <motion.div
        key={movie.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-10 md:p-14 lg:p-16"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="px-3 py-1 bg-accent/90 text-white text-xs font-bold rounded-full tracking-wider uppercase">
              Trending Now
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
              <Star className="w-4 h-4 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </div>
            {year && (
              <span className="text-white/50 text-sm">{year}</span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 tracking-tight"
          >
            {title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-4 text-sm text-white/50 mb-4 flex-wrap"
          >
            {genres.map((g) => (
              <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/70">
                {genreNames[g] || "Unknown"}
              </span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/60 text-sm md:text-base line-clamp-2 mb-8 max-w-xl leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/10 transition-all active:scale-95"
            >
              <Info className="w-5 h-5" />
              Details
            </Link>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/10 transition-all active:scale-95">
              <Plus className="w-5 h-5" />
              Watchlist
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 right-10 flex gap-2 z-10">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? "w-10 bg-accent" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
