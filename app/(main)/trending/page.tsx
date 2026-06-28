"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getImageUrl, formatRating } from "@/lib/utils";
import { TrendingUp, Star, Film, Tv, Ghost } from "lucide-react";

const periods = ["Today", "This Week", "This Month"] as const;

const typeIcon: Record<string, React.ReactNode> = {
  movie: <Film className="w-3 h-3" />,
  tv: <Tv className="w-3 h-3" />,
  anime: <Ghost className="w-3 h-3" />,
};

const typeColor: Record<string, string> = {
  movie: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  tv: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  anime: "text-pink-400 border-pink-400/30 bg-pink-400/10",
};

export default function TrendingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"Today" | "This Week" | "This Month">("This Week");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setItems([]);
    setHasMore(true);
    fetch("/api/tmdb/trending?all=true")
      .then((r) => r.json())
      .then((data) => {
        const results = (data.results || []).slice(0, 50);
        setItems(results);
        setHasMore(results.length >= 20);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

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
              setItems((prev) => [...prev, ...results]);
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
  }, [loading, hasMore, page, loadingMore, period]);

  const getType = (item: any): string => {
    if (item.media_type === "movie") return "movie";
    if (item.media_type === "tv") return "tv";
    const gids: number[] = item.genre_ids || [];
    if (gids.includes(16)) return "anime";
    return item.media_type || "movie";
  };

  const buildHref = (item: any) => {
    const type = getType(item);
    if (type === "tv") return `/watch/tv/${item.id}/1/1`;
    if (type === "movie") return `/watch/movie/${item.id}`;
    return `/watch/movie/${item.id}`;
  };

  const rankedItems = items.slice(0, 50);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-accent rounded-full" />
        <TrendingUp className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold text-white tracking-tight">Trending</h1>
        <span className="text-xs text-muted">Top {rankedItems.length}</span>
      </div>

      <div className="flex gap-1.5 mb-6">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              period === p
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white/70"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3 animate-pulse">
              <div className="w-10 h-5 bg-white/[0.04] rounded" />
              <div className="w-14 h-20 bg-surface rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-white/[0.04] rounded" />
                <div className="h-3 w-24 bg-white/[0.02] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-0">
          {rankedItems.map((item, i) => {
            const rank = i + 1;
            const title = item.title || item.name || "Untitled";
            const year = (item.release_date || item.first_air_date || "").split("-")[0];
            const type = getType(item);

            return (
              <motion.div
                key={`${type}-${item.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i < 10 ? i * 0.05 : 0 }}
              >
                <Link
                  href={buildHref(item)}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all group -mx-3"
                >
                  <div className="w-10 flex-shrink-0 text-center relative">
                    <span className={`text-4xl font-black transition-colors ${rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : "text-white/20 group-hover:text-white/40"}`}>
                      {rank}
                    </span>
                  </div>
                  <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface ring-1 ring-white/[0.06] group-hover:ring-accent/40 transition-all">
                    <img
                      src={getImageUrl(item.poster_path, "w92") || "/placeholder.svg"}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${typeColor[type] || typeColor.movie}`}>
                        {typeIcon[type] || typeIcon.movie}
                        {type}
                      </span>
                      <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">{title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {formatRating(item.vote_average)}
                      </span>
                      {year && <span className="text-xs text-muted">{year}</span>}
                    </div>
                  </div>
                </Link>
                {i < rankedItems.length - 1 && (
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
