"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBackdropUrl } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";

interface CollectionData {
  id: number;
  name: string;
  backdrop_path?: string | null;
  movies: { id: number; title?: string; poster_path: string | null }[];
}

interface Props {
  collections: CollectionData[];
}

export default function CollectionSection({ collections }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.6;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!collections.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="mb-8 md:mb-6"
    >
      <div className="flex items-center justify-between mb-4 md:mb-3">
        <h2 className="text-xl md:text-base font-bold text-white tracking-tight">Collections</h2>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("left")}
            className="p-2 md:p-1.5 rounded-lg bg-[#2A2A2A] hover:bg-accent/80 text-white/70 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("right")}
            className="p-2 md:p-1.5 rounded-lg bg-[#2A2A2A] hover:bg-accent/80 text-white/70 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
          </motion.button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-3 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {collections.map((col) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
          >
            <Link
              href={`/collection/${col.id}`}
              className="group flex-shrink-0 w-[300px] sm:w-[240px] snap-start relative h-[160px] sm:h-[120px] rounded-2xl overflow-hidden bg-[#171717] border border-[#2A2A2A] hover:border-accent/40 transition-all duration-200 block"
            >
              {col.backdrop_path ? (
                <img
                  src={getBackdropUrl(col.backdrop_path) || ""}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#171717]">
                  <Film className="w-6 h-6 text-white/15" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                  {col.name}
                </h3>
                <span className="text-[11px] text-white/50 mt-0.5 block">
                  {col.movies.length} {col.movies.length === 1 ? "movie" : "movies"}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
