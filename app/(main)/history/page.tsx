"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl, formatTime } from "@/lib/utils";
import { History, Play, Trash2 } from "lucide-react";
import type { WatchHistory } from "@/types";

export default function HistoryPage() {
  const [items, setItems] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("watch_history")
      .select("*")
      .eq("user_id", user.user.id)
      .order("watched_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!supabase) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase.from("watch_history").delete().eq("user_id", user.user.id);
    setItems([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">History</h1>
        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-white/40 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-white/40">
          <History className="w-12 h-12 mb-3" />
          <p>No watch history</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/watch/${item.movie_id}`}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                <img
                  src={getImageUrl(item.poster_path, "w185")}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                  <span>
                    {formatTime(item.progress)} / {formatTime(item.duration)}
                  </span>
                  {item.progress > 0 && (
                    <span className="text-purple-400">
                      {Math.round((item.progress / item.duration) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <Play className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
