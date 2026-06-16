"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl, formatRating } from "@/lib/utils";
import type { Movie } from "@/types";
import { Play, Star, Plus, Info } from "lucide-react";

interface Props {
  movie: Movie;
  index?: number;
  priority?: boolean;
}

export default function MovieCard({ movie, index = 0, priority }: Props) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start"
    >
      <Link
        href={`/watch/${movie.id}`}
        className="group"
      >
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-card mb-2 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-accent/10 group-hover:-translate-y-1">
          <img
            src={getImageUrl(movie.poster_path, "w342")}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
            </div>
            <div className="flex gap-2 mt-1">
              <span className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5 text-white" />
              </span>
              <span className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                <Info className="w-3.5 h-3.5 text-white" />
              </span>
            </div>
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[11px] font-bold text-yellow-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </span>
          </div>

          {year && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[11px] text-white/70 font-medium">
              {year}
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate px-0.5">
          {title}
        </h3>
      </Link>
    </motion.div>
  );
}
