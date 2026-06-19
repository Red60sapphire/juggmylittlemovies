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
  featured?: boolean;
}

export default function MovieCard({ movie, index = 0, priority, featured }: Props) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const mediaType = movie.media_type || (movie.title ? "movie" : "tv");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="flex-shrink-0 snap-start w-[160px] sm:w-[180px] md:w-[200px]"
    >
      <Link
        href={mediaType === "tv" ? `/watch/tv/${movie.id}/1/1` : `/watch/movie/${movie.id}`}
        className="group block active:scale-95 transition-transform duration-150"
      >
        <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[#1B1B1B] shadow-xl shadow-black/40 transition-all duration-300 group-hover:shadow-accent/20 group-hover:-translate-y-0.5">
          <img
            src={getImageUrl(movie.poster_path, featured ? "w500" : "w342")}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-accent/30 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
          </div>

          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-yellow-400 tabular-nums">{formatRating(movie.vote_average)}</span>
          </div>

          {year && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md border border-white/10">
              <span className="text-[10px] font-semibold text-white/80">{year}</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2.5 pb-3">
            <h3 className="text-xs font-semibold text-white leading-tight line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
