"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getImageUrl, formatTime } from "@/lib/utils";
import { History, Play, Trash2, Clock } from "lucide-react";
import type { WatchHistory } from "@/types";

export default function HistoryPage() {
  const [items, setItems] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data: { items: WatchHistory[] }) => setItems(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clearHistory = async () => {
    await Promise.all(
      items.map((item) =>
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie_id: item.movie_id, title: "", poster_path: null, progress: 0, duration: 0 }),
        })
      )
    );
    setItems([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold text-accent">Your Library</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">History</h1>
          <p className="mt-1 text-sm text-white/45">{items.length} watched</p>
        </div>
        {items.length > 0 && (
          <button onClick={clearHistory} className="px-4 py-2 text-sm font-medium text-white/50 hover:text-red-400 rounded-xl hover:bg-white/[0.04] transition-all">
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] rounded-2xl border border-white/[0.06] bg-[#121218]">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white/70">No watch history</h3>
          <p className="text-sm text-white/40 mt-1">Movies you watch will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/watch/${item.movie_id}`}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.04] transition-all group animate-slide-in-right"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: "backwards" }}
            >
              <div className="w-20 h-24 md:w-16 md:h-20 rounded-xl overflow-hidden bg-[#1B1B1B] flex-shrink-0 ring-1 ring-white/[0.06]">
                <img src={getImageUrl(item.poster_path, "w185")} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-sm font-semibold text-white truncate">{item.title}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-white/40">{formatTime(item.progress)} / {formatTime(item.duration)}</span>
                  {item.progress > 0 && item.duration > 0 && (
                    <span className="text-xs font-medium text-accent">{Math.round((item.progress / item.duration) * 100)}%</span>
                  )}
                </div>
                {item.progress > 0 && item.duration > 0 && (
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden max-w-xs">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min((item.progress / item.duration) * 100, 100)}%` }} />
                  </div>
                )}
              </div>
              <Play className="w-5 h-5 text-white/20 group-hover:text-accent transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
