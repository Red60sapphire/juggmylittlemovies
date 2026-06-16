"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl, formatRating } from "@/lib/utils";
import { Bookmark, Star, Trash2 } from "lucide-react";
import type { WatchlistItem } from "@/types";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.user.id)
      .order("added_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
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
      <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-white/40">
          <Bookmark className="w-12 h-12 mb-3" />
          <p>Your watchlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/watch/${item.movie_id}`}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2">
                  <img
                    src={getImageUrl(item.poster_path, "w342")}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded-md text-xs font-semibold text-yellow-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {item.vote_average}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white/90 truncate">
                  {item.title}
                </h3>
              </Link>
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
