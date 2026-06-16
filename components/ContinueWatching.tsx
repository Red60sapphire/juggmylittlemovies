"use client";

import Link from "next/link";
import { getImageUrl, formatTime } from "@/lib/utils";
import type { WatchHistory } from "@/types";
import { Play } from "lucide-react";

interface Props {
  items: WatchHistory[];
}

export default function ContinueWatching({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Continue Watching</h2>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/watch/${item.movie_id}`}
            className="group flex-shrink-0 w-[260px]"
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
    </section>
  );
}
