"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl, formatTime } from "@/lib/utils";
import {
  History, Play, Trash2, Clock, ChevronLeft, ChevronRight,
  Film, Tv, Ghost, Radio, X, Info, AlertCircle
} from "lucide-react";
import { getLocalHistory, clearLocalHistory, removeFromLocalHistory } from "@/lib/localHistory";
import type { LocalHistoryItem } from "@/lib/local-storage";

type FilterType = "all" | "movie" | "tv" | "anime" | "live";

const FILTERS: { key: FilterType; label: string; icon: typeof Film }[] = [
  { key: "all", label: "All Content", icon: Film },
  { key: "movie", label: "Movies", icon: Film },
  { key: "tv", label: "TV Shows", icon: Tv },
  { key: "anime", label: "Anime", icon: Ghost },
  { key: "live", label: "Live TV", icon: Radio },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(true);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function getDateGroup(watchedAt: string): string {
  const now = new Date();
  const d = new Date(watchedAt);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const sameDay = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (sameDay) return "Today";
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return "Earlier This Week";
  return "Older";
}

function getMediaTypeLabel(type?: string): string {
  switch (type) {
    case "movie": return "Movie";
    case "tv": return "TV Show";
    case "anime": return "Anime";
    case "live": return "Live TV";
    default: return "Movie";
  }
}

function getMediaTypeColor(type?: string): string {
  switch (type) {
    case "movie": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "tv": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "anime": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    case "live": return "bg-green-500/20 text-green-400 border-green-500/30";
    default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
}

function HistoryCard({
  item,
  onRemove,
  index,
}: {
  item: LocalHistoryItem;
  onRemove: (id: number) => void;
  index: number;
}) {
  const progress = item.duration > 0 ? Math.min((item.progress / item.duration) * 100, 100) : 0;
  const isUnfinished = progress > 0 && progress < 95;
  const lastWatched = new Date(item.watched_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="flex-shrink-0 snap-start w-[160px] sm:w-[180px]"
    >
      <div className="group relative active:scale-[0.97] transition-transform duration-150">
        <Link
          href={`/watch/movie/${item.movie_id}`}
          className="block"
        >
          <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#1B1B1B] shadow-lg shadow-black/40 transition-all duration-300 group-hover:shadow-accent/15 group-hover:shadow-xl group-hover:-translate-y-1">
            <img
              src={getImageUrl(item.poster_path, "w342")}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-accent/30 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
            </div>

            <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold backdrop-blur-sm ${getMediaTypeColor(item.media_type)}`}>
              {getMediaTypeLabel(item.media_type)}
            </div>

            {isUnfinished && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/80 backdrop-blur-sm rounded-md border border-amber-400/30">
                <span className="text-[9px] font-bold text-white">In Progress</span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-2.5 pb-3">
              <h3 className="text-xs font-semibold text-white leading-tight line-clamp-2 drop-shadow-lg">
                {item.title}
              </h3>
            </div>
          </div>
        </Link>

        <div className="mt-2 space-y-1">
          {(item.progress > 0 || item.duration > 0) && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-white/40 tabular-nums whitespace-nowrap">
                {formatTime(item.progress)} / {formatTime(item.duration)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {lastWatched}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); onRemove(item.movie_id); }}
              className="p-1 rounded-md bg-white/5 hover:bg-red-500/30 text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              title="Remove from history"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HistoryRow({
  title,
  items,
  onRemove,
}: {
  title: string;
  items: LocalHistoryItem[];
  onRemove: (id: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="mb-6 md:mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-accent" />
          <h2 className="text-sm md:text-base font-bold text-white tracking-tight">{title}</h2>
          <span className="text-[10px] text-white/30 font-medium">({items.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/80 text-white/40 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/80 text-white/40 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <HistoryCard key={item.movie_id} item={item} onRemove={onRemove} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px] animate-pulse">
      <div className="w-full aspect-[2/3] rounded-xl bg-white/5" />
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 bg-white/5 rounded-full w-3/4" />
        <div className="h-2 bg-white/5 rounded-full w-1/2" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-white/5" />
        <div className="h-4 bg-white/5 rounded-full w-32" />
      </div>
      <div className="flex gap-2 md:gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Film;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-90 border ${
        active
          ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
          : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80"
      }`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] text-white/30"
    >
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <History className="w-9 h-9" />
      </div>
      <h3 className="text-lg font-bold text-white/50 mb-1">No watch history</h3>
      <p className="text-sm text-white/30 max-w-xs text-center leading-relaxed">
        Movies and shows you watch will appear here. Start exploring to build your history.
      </p>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState<LocalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setItems(getLocalHistory());
    setLoading(false);
  }, []);

  const clearAll = () => {
    clearLocalHistory();
    setItems([]);
    setShowClearConfirm(false);
  };

  const removeItem = (movieId: number) => {
    removeFromLocalHistory(movieId);
    setItems((prev) => prev.filter((i) => i.movie_id !== movieId));
  };

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => (i.media_type || "movie") === filter);
  }, [items, filter]);

  const grouped = useMemo(() => {
    const groups: Record<string, LocalHistoryItem[]> = {};
    const order: string[] = [];
    for (const item of filtered) {
      const key = getDateGroup(item.watched_at);
      if (!groups[key]) {
        groups[key] = [];
        order.push(key);
      }
      groups[key].push(item);
    }
    const priority = ["Today", "Yesterday", "Earlier This Week", "Older"];
    order.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
    return { groups, order };
  }, [filtered]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-white/5 rounded-full w-24 animate-pulse" />
          <div className="h-6 bg-white/5 rounded-full w-20 animate-pulse" />
        </div>
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 bg-white/5 rounded-full w-24 animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <main id="main-content" className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Watch History</h1>
        {items.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-4 scrollbar-hide">
          {FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              active={filter === f.key}
              label={f.label}
              icon={f.icon}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300/80 flex-1">This will permanently delete all watch history.</p>
            <button onClick={clearAll} className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-400 transition-all active:scale-90">
              Confirm
            </button>
            <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-all active:scale-90">
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {grouped.order.map((group) => (
              <HistoryRow
                key={group}
                title={group}
                items={grouped.groups[group]}
                onRemove={removeItem}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length > 0 && (
        <div className="text-center py-6">
          <p className="text-[11px] text-white/15">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </p>
        </div>
      )}
    </main>
  );
}
