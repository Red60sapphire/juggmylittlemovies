"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl, formatRating } from "@/lib/utils";
import { Play, Star } from "lucide-react";

interface Props {
  movie: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
    genre_ids?: number[];
  };
  index?: number;
  priority?: boolean;
  mediaType?: "movie" | "tv" | "anime";
}

export default function MovieCard({ movie, index = 0, priority, mediaType }: Props) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const type = mediaType || movie.media_type || "movie";

  const href = type === "movie"
    ? `/watch/movie/${movie.id}`
    : type === "tv"
      ? `/watch/tv/${movie.id}/1/1`
      : `/watch/movie/${movie.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="w-[200px] sm:w-[150px]"
    >
      <Link href={href} className="group block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-150 group-hover:ring-accent/50 group-hover:scale-[1.03] img-zoom">
          <img
            src={getImageUrl(movie.poster_path ?? null, "w342") || "/placeholder.svg"}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/25 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-4.5 h-4.5 fill-white text-white ml-0.5" />
            </div>
          </div>
          {type && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[9px] font-bold text-white/80 uppercase tracking-wider">
              {type}
            </div>
          )}
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {formatRating(movie.vote_average || 0)}
          </div>
          {year && (
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] text-white/60 font-medium">
              {year}
            </div>
          )}
        </div>
        <h3 className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate px-0.5 mt-1.5 leading-snug">
          {title}
        </h3>
      </Link>
    </motion.div>
  );
}
