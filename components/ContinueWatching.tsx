"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl, formatTime } from "@/lib/utils";
import { getLocalHistory } from "@/lib/localHistory";
import type { WatchHistory } from "@/types";
import { Play, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface Props {
  items: WatchHistory[];
}

export default function ContinueWatching({ items: serverItems }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
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

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
    }
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [items]);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!items.length) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-white">Continue Watching</h2>
        </div>
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
            <Clock className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-sm text-white/30">
            Start watching a movie and it will show up here
          </p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold text-white">Continue Watching</h2>
      </div>
      <div className="relative group/row">
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-2 z-10 w-12 bg-gradient-to-r from-[#050505] to-transparent flex items-center justify-start pl-2 transition-opacity ${
            showLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex-shrink-0 w-[280px] snap-start"
            >
              <Link
                href={`/watch/${item.movie_id}`}
                className="group block"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                  <img
                    src={getImageUrl(item.poster_path, "w342")}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-accent/30 translate-y-2 group-hover:translate-y-0">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (item.progress / (item.duration || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between px-0.5">
                  <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                    {item.title}
                  </h3>
                  {item.duration > 0 && (
                    <span className="text-xs text-white/40 flex-shrink-0 ml-3 tabular-nums">
                      {formatTime(item.duration - item.progress)} left
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-2 z-10 w-12 bg-gradient-to-l from-[#050505] to-transparent flex items-center justify-end pr-2 transition-opacity ${
            showRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </motion.section>
  );
}
