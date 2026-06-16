"use client";

import { useRef } from "react";
import Link from "next/link";
import { getImageUrl, formatTime } from "@/lib/utils";
import type { WatchHistory } from "@/types";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  items: WatchHistory[];
}

export default function ContinueWatching({ items }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Continue Watching</h2>
      <div className="relative group/row">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[#0a0a0f] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-start pl-2"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/watch/${item.movie_id}`}
              className="group flex-shrink-0 w-[260px] snap-start"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5">
                <img
                  src={getImageUrl(item.poster_path, "w342")}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{
                      width: `${Math.min(
                        (item.progress / item.duration) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/90 truncate">
                  {item.title}
                </h3>
                <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                  {formatTime(item.duration - item.progress)} left
                </span>
              </div>
            </Link>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[#0a0a0f] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-end pr-2"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}
