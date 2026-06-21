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
      className="flex-shrink-0 w-[220px] sm:w-[160px] snap-start"
    >
      <Link href={`/watch/${movie.id}`} className="group block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1B1B1B] mb-1.5 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/30 group-hover:shadow-xl group-hover:shadow-accent/10 group-hover:-translate-y-0.5">
          <img
            src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/20">
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
          </div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {formatRating(movie.vote_average)}
          </div>
          {year && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[10px] text-white/70 font-medium">
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
