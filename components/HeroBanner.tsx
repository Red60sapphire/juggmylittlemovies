"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBackdropUrl, formatRating } from "@/lib/utils";
import type { Movie } from "@/types";
import { Play, Info, Star, ChevronRight } from "lucide-react";

const GENRE_NAMES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

interface Props {
  movies: Movie[];
}

export default function HeroBanner({ movies }: Props) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const movie = movies[current];
  const max = Math.min(movies.length, 5);

  const goNext = useCallback(() => setCurrent((prev) => (prev + 1) % max), [max]);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [goNext]);

  if (!movie || !mounted) {
    return (
      <div className="relative w-full h-[38vh] min-h-[300px] md:min-h-[400px] md:h-[50vh] md:max-h-[650px] rounded-2xl overflow-hidden bg-[#1B1B1B] animate-pulse mb-4" />
    );
  }

  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const mediaType = movie.media_type || (movie.title ? "movie" : "tv");
  const genres = movie.genre_ids?.slice(0, 2).map((id) => GENRE_NAMES[id]).filter(Boolean) || [];

  return (
    <section className="relative w-full h-[38vh] min-h-[320px] md:min-h-[420px] md:h-[50vh] md:max-h-[680px] overflow-hidden rounded-2xl mb-4 shadow-2xl shadow-black/40">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img src={getBackdropUrl(movie.backdrop_path) || ""} alt="" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 via-15% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/70 via-transparent to-transparent" />

      <div className="absolute inset-0 flex items-end pb-4 md:pb-8 px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full tracking-wider uppercase bg-accent/20 text-accent border border-accent/30">
                {mediaType === "tv" ? "Series" : "Movie"}
              </span>
              <div className="flex items-center gap-1 text-yellow-400 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-yellow-400" />
                {formatRating(movie.vote_average)}
              </div>
              {year && <span className="text-white/50 text-[11px] font-medium">{year}</span>}
              {genres.length > 0 && genres.map((g) => (
                <span key={g} className="text-[10px] text-white/40 font-medium hidden sm:inline">| {g}</span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight leading-tight drop-shadow-xl">
              {title}
            </h1>

            <p className="text-white/40 text-sm line-clamp-2 mb-3 max-w-xl leading-relaxed hidden md:block">
              {movie.overview}
            </p>

            <div className="flex items-center gap-2.5">
              <Link
                href={mediaType === "tv" ? `/watch/tv/${movie.id}/1/1` : `/watch/movie/${movie.id}`}
                className="flex items-center gap-2.5 px-8 py-3 md:px-6 md:py-2.5 bg-white text-black hover:bg-white/90 text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-white/10"
              >
                <Play className="w-5 h-5 fill-black" />
                Play
              </Link>
              <Link
                href={`/movie/${movie.id}`}
                className="flex items-center gap-2 px-6 py-3 md:px-5 md:py-2.5 bg-transparent hover:bg-white/10 text-white/80 hover:text-white text-sm font-semibold rounded-xl border border-white/20 hover:border-white/40 transition-all active:scale-95"
              >
                <Info className="w-4 h-4" />
                More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-3 left-4 md:left-8 flex items-center gap-2 z-10">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative h-1.5 rounded-full overflow-hidden transition-all duration-500 active:scale-90"
            style={{ width: i === current ? "24px" : "5px" }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full" />
            <div
              className="absolute inset-0 bg-white/90 rounded-full"
              style={{
                transform: i === current ? "scaleX(1)" : "scaleX(0)",
                animation: i === current ? "progressFill 7s linear forwards" : "none",
              }}
            />
          </button>
        ))}
      </div>

      <div className="absolute bottom-3 right-4 md:right-8 z-10 hidden md:flex items-center gap-2">
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + max) % max)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/10"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <button
          onClick={goNext}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        @keyframes progressFill {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </section>
  );
}
