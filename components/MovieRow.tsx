"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import type { Movie } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  title: string;
  movies: Movie[];
}

export default function MovieRow({ title, movies }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-8 md:mb-6"
    >
      <div className="flex items-center justify-between mb-4 md:mb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-xl md:text-base font-bold text-white tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 md:p-1.5 rounded-lg bg-white/[0.06] hover:bg-accent/80 text-white/50 hover:text-white transition-all active:scale-90 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 md:p-1.5 rounded-lg bg-white/[0.06] hover:bg-accent/80 text-white/50 hover:text-white transition-all active:scale-90 backdrop-blur-sm"
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
          <MovieCard key={movie.id} movie={movie} index={i} />
        ))}
      </div>
    </motion.section>
  );
}
