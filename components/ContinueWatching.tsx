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
      <section className="mb-8 md:mb-6">
        <div className="flex items-center justify-between mb-4 md:mb-3">
          <h2 className="text-xl md:text-base font-bold text-white tracking-tight">Continue Watching</h2>
        </div>
        <div className="py-8 text-center rounded-xl bg-[#111] border border-[#2A2A2A]">
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
      className="mb-8 md:mb-6"
    >
      <div className="flex items-center justify-between mb-4 md:mb-3">
        <h2 className="text-xl md:text-base font-bold text-white tracking-tight">Continue Watching</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 md:p-1.5 rounded-lg bg-[#2A2A2A] hover:bg-accent/80 text-white/70 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 md:p-1.5 rounded-lg bg-[#2A2A2A] hover:bg-accent/80 text-white/70 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-3 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex-shrink-0 w-[320px] sm:w-[240px] snap-start"
          >
            <Link href={`/watch/${item.movie_id}`} className="group block">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1B1B1B] mb-2 shadow-md">
                <img
                  src={getImageUrl(item.poster_path, "w342")}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg translate-y-2 group-hover:translate-y-0">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${Math.min((item.progress / (item.duration || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 px-0.5">
                <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                  {item.title}
                </h3>
                {item.duration > 0 && (
                  <span className="text-xs text-white/40 flex-shrink-0 tabular-nums">
                    {formatTime(item.duration - item.progress)} left
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
