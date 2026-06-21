"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl, formatRating } from "@/lib/utils";
import type { Movie } from "@/types";
import { Play, Star } from "lucide-react";

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
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="w-[200px] sm:w-[150px]"
    >
      <Link href={`/watch/${movie.id}`} className="group block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface mb-1.5 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:shadow-xl group-hover:shadow-accent/15 group-hover:-translate-y-1">
          <img
            src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/25">
              <Play className="w-4.5 h-4.5 fill-white text-white ml-0.5" />
            </div>
          </div>
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {formatRating(movie.vote_average)}
          </div>
          {year && (
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] text-white/60 font-medium">
              {year}
            </div>
          )}
        </div>
        <h3 className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate px-0.5 leading-snug">
          {title}
        </h3>
      </Link>
    </motion.div>
  );
}
