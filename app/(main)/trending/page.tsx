"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { getImageUrl, formatRating } from "@/lib/utils";
import { TrendingUp, Star, Trophy, Award, Medal } from "lucide-react";
import Link from "next/link";

const rankColors = [
  "text-yellow-400", "text-gray-300", "text-amber-600",
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return null;
};

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/tmdb/trending?all=true")
      .then((r) => r.json())
      .then((data) => {
        const results = data.results || [];
        setMovies(results);
        setHasMore(results.length >= 100);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          fetch(`/api/tmdb/trending?all=true&page=${nextPage}`)
            .then((r) => r.json())
            .then((data) => {
              const results = data.results || [];
              setMovies((prev) => [...prev, ...results]);
              setHasMore(results.length >= 20);
              setPage(nextPage);
              setLoadingMore(false);
            })
            .catch(() => setLoadingMore(false));
        }
      },
      { rootMargin: "300px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadingMore]);

  const rankedMovies = movies.slice(0, 50);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-accent rounded-full" />
        <TrendingUp className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold text-white tracking-tight">Trending</h1>
        <span className="text-xs text-muted">Top {rankedMovies.length}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-0">
          {rankedMovies.map((movie, i) => {
            const rank = i + 1;
            const title = movie.title || movie.name || "Untitled";
            const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.5) }}
              >
                <Link
                  href={`/watch/${movie.id}`}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all group -mx-3"
                >
                  <div className="w-10 flex-shrink-0 text-center">
                    {rankIcon(rank) || (
                      <span className={`text-lg font-black ${rank <= 3 ? rankColors[rank - 1] : "text-white/20 group-hover:text-white/40 transition-colors"}`}>
                        {rank}
                      </span>
                    )}
                  </div>
                  <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface ring-1 ring-white/[0.06] group-hover:ring-accent/40 transition-all">
                    <img
                      src={getImageUrl(movie.poster_path, "w92") || "/placeholder.svg"}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">{title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {formatRating(movie.vote_average)}
                      </span>
                      {year && <span className="text-xs text-muted">{year}</span>}
                    </div>
                  </div>
                  <div className="hidden sm:block text-xs text-muted w-16 text-right">
                    #{rank}
                  </div>
                </Link>
                {i < rankedMovies.length - 1 && (
                  <div className="ml-[4.5rem] mr-3 h-px bg-white/[0.04]" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div ref={sentinelRef} className="h-10" />
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
