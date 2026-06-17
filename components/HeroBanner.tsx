"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBackdropUrl, formatRating } from "@/lib/utils";
import type { Movie } from "@/types";
import { Play, Info, Star } from "lucide-react";

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
    return <div className="relative w-full h-[60vh] min-h-[480px] md:min-h-[400px] md:h-[55vh] md:max-h-[650px] rounded-none md:rounded-2xl overflow-hidden bg-[#1B1B1B] animate-shimmer" />;
  }

  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];

  return (
    <section className="relative w-full h-[60vh] min-h-[480px] md:min-h-[400px] md:h-[55vh] md:max-h-[650px] overflow-hidden rounded-none md:rounded-2xl mb-8 md:mb-6">
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
            <img src={getBackdropUrl(m.backdrop_path) || ""} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />

      <motion.div
        key={movie.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-10"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-2 mb-3 md:mb-3"
          >
            <span className="px-2.5 py-0.5 bg-accent/90 text-white text-[10px] font-bold rounded-full tracking-wider uppercase">
              Trending Now
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
              <Star className="w-3 h-3 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </div>
            {year && <span className="text-white/50 text-xs">{year}</span>}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-3 tracking-tight leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-white/60 text-sm sm:text-sm line-clamp-2 mb-4 md:mb-5 max-w-xl leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex items-center gap-2.5 flex-wrap"
          >
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2.5 px-7 py-3.5 md:px-6 md:py-2.5 bg-accent hover:bg-accent-hover text-white text-sm md:text-sm font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2.5 px-6 py-3.5 md:px-4 md:py-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-sm md:text-sm font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Info className="w-5 h-5" />
              Details
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 flex gap-2 z-10">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 active:scale-90 ${
              i === current ? "w-8 bg-accent" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
