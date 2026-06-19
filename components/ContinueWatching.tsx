"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl, formatTime } from "@/lib/utils";
import { getLocalHistory } from "@/lib/localHistory";
import type { WatchHistory } from "@/types";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  items: WatchHistory[];
}

export default function ContinueWatching({ items: serverItems }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<WatchHistory[]>(serverItems);

  useEffect(() => {
    const local = getLocalHistory();
    if (local.length > 0) {
      const merged = [...serverItems];
      for (const localItem of local) {
        if (!merged.some((m) => m.movie_id === localItem.movie_id)) {
          merged.push(localItem);
        }
      }
      setItems(merged);
    }
  }, [serverItems]);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) {
    return (
      <section className="mb-5">
        <div className="flex items-center gap-2 mb-2.5 px-0.5">
          <div className="w-1 h-3.5 rounded-full bg-accent" />
          <h2 className="text-sm font-bold text-white tracking-tight">Continue Watching</h2>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <Play className="w-4 h-4 text-white/20 flex-shrink-0" />
          <p className="text-sm text-white/30">Start watching a movie and it will show up here</p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-5"
    >
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3.5 rounded-full bg-accent" />
          <h2 className="text-sm font-bold text-white tracking-tight">Continue Watching</h2>
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
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
            className="flex-shrink-0 w-[260px] sm:w-[220px] snap-start"
          >
            <Link href={`/watch/movie/${item.movie_id}`} className="group block">
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#1B1B1B] shadow-lg shadow-black/30 transition-shadow duration-300 group-hover:shadow-accent/20">
                <img
                  src={getImageUrl(item.poster_path, "w342")}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg translate-y-2 group-hover:translate-y-0">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 pb-3">
                  <h3 className="text-sm font-semibold text-white leading-tight line-clamp-1 drop-shadow-lg">
                    {item.title}
                  </h3>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min((item.progress / (item.duration || 1)) * 100, 100)}%` }}
                  />
                </div>

                {/* Time left */}
                {item.duration > 0 && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 shadow-lg">
                    <span className="text-[10px] font-semibold text-white/80 tabular-nums">
                      {formatTime(item.duration - item.progress)}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
