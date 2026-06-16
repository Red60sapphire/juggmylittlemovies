"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getImageUrl, getBackdropUrl, formatRating } from "@/lib/utils";
import type { Movie } from "@/types";
import { Info, Play, Star } from "lucide-react";

interface Props {
  movies: Movie[];
}

export default function HeroBanner({ movies }: Props) {
  const [current, setCurrent] = useState(0);
  const movie = movies[current];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movie) return null;

  const title = movie.title || movie.name || "Untitled";

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden rounded-2xl group">
      {movies.slice(0, 5).map((m, i) => (
        <div
          key={m.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={getBackdropUrl(m.backdrop_path) || ""}
            alt={m.title || m.name || ""}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-0.5 bg-purple-600/80 text-white text-xs font-semibold rounded">
              TRENDING
            </span>
            <span className="flex items-center gap-1 text-yellow-400 text-sm">
              <Star className="w-4 h-4 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            {title}
          </h1>
          <p className="text-white/70 text-sm md:text-base line-clamp-2 mb-6 max-w-xl">
            {movie.overview}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-colors"
            >
              <Info className="w-5 h-5" />
              Details
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 flex gap-2">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-8 bg-purple-500" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
