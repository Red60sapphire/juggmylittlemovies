"use client";

import { useRef, useState, useEffect } from "react";
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
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) { el.addEventListener("scroll", checkScroll); checkScroll(); }
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [movies]);

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
        <h2 className="text-xl md:text-base font-bold text-white tracking-tight">{title}</h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            className={`p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 transition-all ${
              showLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 transition-all ${
              showRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5 text-white" />
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
