"use client";

import Link from "next/link";
import { getImageUrl, formatRating } from "@/lib/utils";
import type { Movie } from "@/types";
import { Play, Star } from "lucide-react";

interface Props {
  movie: Movie;
  priority?: boolean;
}

export default function MovieCard({ movie, priority }: Props) {
  const title = movie.title || movie.name || "Untitled";

  return (
    <Link
      href={`/watch/${movie.id}`}
      className="group flex-shrink-0 w-[180px] snap-start"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2">
        <img
          src={getImageUrl(movie.poster_path, "w342")}
          alt={title}
          loading={priority ? "eager" : "lazy"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-purple-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded-md text-xs font-semibold text-yellow-400 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400" />
          {formatRating(movie.vote_average)}
        </div>
      </div>
      <h3 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-xs text-white/40">
        {movie.release_date?.split("-")[0] ||
          movie.first_air_date?.split("-")[0] ||
          ""}
      </p>
    </Link>
  );
}
