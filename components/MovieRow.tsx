"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import type { Movie } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  title: string;
  movies: Movie[];
  variant?: "default" | "compact" | "featured";
}

export default function MovieRow({ title, movies, variant = "default" }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 1.0;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="mb-5 md:mb-5"
    >
      <div className="flex items-center justify-between mb-2.5 md:mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3.5 rounded-full bg-accent" />
          <h2 className="text-sm md:text-base font-bold text-white tracking-tight">{title}</h2>
          {variant !== "default" && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-accent/30 text-accent bg-accent/10">
              {variant === "featured" ? "Featured" : "New"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/80 text-white/40 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/80 text-white/40 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-2 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie, i) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            index={i}
            priority={variant === "featured" && i < 3}
          />
        ))}
      </div>
    </motion.section>
  );
}
