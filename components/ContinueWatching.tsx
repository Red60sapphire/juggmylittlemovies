"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl, formatTime } from "@/lib/utils";
import { getLocalHistory } from "@/lib/localHistory";
import type { WatchHistory } from "@/types";
import { Play } from "lucide-react";
import HorizontalSlider from "./HorizontalSlider";

interface Props {
  items: WatchHistory[];
}

export default function ContinueWatching({ items: serverItems }: Props) {
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

  if (!items.length) {
    return (
      <section className="mb-6">
        <div className="flex items-center mb-3">
          <div className="w-0.5 h-4 bg-accent rounded-full mr-2.5 flex-shrink-0" />
          <h2 className="text-lg md:text-base font-bold text-white tracking-tight">Continue Watching</h2>
        </div>
        <div className="py-8 text-center rounded-lg bg-surface border border-border">
          <p className="text-sm text-muted">Start watching a movie and it will show up here</p>
        </div>
      </section>
    );
  }

  return (
    <HorizontalSlider
      title="Continue Watching"
      items={items}
      renderCard={(item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
          className="w-[300px] sm:w-[230px]"
        >
          <Link href={`/watch/${item.movie_id}`} className="group block">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-surface mb-2 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:shadow-xl group-hover:shadow-accent/15 group-hover:-translate-y-0.5">
              <img
                src={getImageUrl(item.poster_path, "w342")}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg translate-y-2 group-hover:translate-y-0">
                  <Play className="w-4.5 h-4.5 fill-white text-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${Math.min((item.progress / (item.duration || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 px-0.5">
              <h3 className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate">
                {item.title}
              </h3>
              {item.duration > 0 && (
                <span className="text-[11px] text-muted flex-shrink-0 tabular-nums">
                  {formatTime(item.duration - item.progress)} left
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      )}
    />
  );
}
