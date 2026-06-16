"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl, formatTime } from "@/lib/utils";
import { Clock, Play } from "lucide-react";
import type { WatchHistory } from "@/types";

export default function ContinueWatchingPage() {
  const [items, setItems] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Continue Watching</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-white/40">
          <Clock className="w-12 h-12 mb-3" />
          <p>Nothing to continue</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/watch/${item.movie_id}`}
              className="group"
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
                    className="h-full bg-purple-500"
                    style={{
                      width: `${Math.min(
                        (item.progress / item.duration) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-white/90 truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-white/40">
                  {formatTime(item.duration - item.progress)} left
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
