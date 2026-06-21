"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getImageUrl, formatTime } from "@/lib/utils";
import { Clock, Play } from "lucide-react";
import type { WatchHistory } from "@/types";

export default function ContinueWatchingPage() {
  const [items, setItems] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data: { items: WatchHistory[] }) => setItems(data.items.filter((i: WatchHistory) => i.progress > 0 && i.progress < i.duration)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div>
        <p className="text-sm font-semibold text-accent">Your Library</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Continue Watching</h1>
        <p className="mt-1 text-sm text-white/45">{items.length} in progress</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] rounded-2xl border border-white/[0.06] bg-[#121218] mt-8">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white/70">Nothing to continue</h3>
          <p className="text-sm text-white/40 mt-1">Start watching a movie and come back anytime</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
          {items.map((item) => (
            <Link key={item.id} href={`/watch/${item.movie_id}`} className="group animate-scale-in">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1B1B1B] ring-1 ring-white/[0.06] group-hover:ring-accent/30 transition-all">
                <img src={getImageUrl(item.poster_path, "w342")} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg translate-y-2 group-hover:translate-y-0">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                  <div className="h-full bg-accent transition-all duration-500" style={{ width: `${Math.min((item.progress / (item.duration || 1)) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">{item.title}</h3>
                {item.duration > 0 && (
                  <p className="text-xs text-white/40 mt-0.5">{formatTime(item.duration - item.progress)} left</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
