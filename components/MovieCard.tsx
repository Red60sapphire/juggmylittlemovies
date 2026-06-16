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
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="flex-shrink-0 w-[180px] sm:w-[160px] snap-start"
    >
      <Link href={`/watch/${movie.id}`} className="group block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1B1B1B] mb-1.5 shadow-lg transition-all duration-300 group-hover:shadow-accent/10 group-hover:-translate-y-0.5">
          <img
            src={getImageUrl(movie.poster_path, "w342")}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <div className="w-10 h-10 rounded-full bg-accent/90 flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            </div>
          </div>
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {formatRating(movie.vote_average)}
          </div>
          {year && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[10px] text-white/70 font-medium">
              {year}
            </div>
          )}
        </div>
        <h3 className="text-sm sm:text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate px-0.5">
          {title}
        </h3>
      </Link>
    </motion.div>
  );
}
