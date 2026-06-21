"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getImageUrl, formatRating } from "@/lib/utils";
import { Bookmark, Star, Trash2, LogIn } from "lucide-react";
import type { WatchlistItem } from "@/types";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data: { items: WatchlistItem[] }) => setItems(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (id: string) => {
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie_id: 0, title: "", poster_path: null, vote_average: 0 }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
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
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Watchlist</h1>
          <p className="mt-1 text-sm text-white/45">{items.length} saved</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] rounded-2xl border border-white/[0.06] bg-[#121218]">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Bookmark className="w-7 h-7 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white/70">Your watchlist is empty</h3>
          <p className="text-sm text-white/40 mt-1 mb-6">Movies you save will appear here</p>
          <Link href="/movies" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative animate-scale-in">
              <Link href={`/watch/${item.movie_id}`}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1B1B1B] mb-2 ring-1 ring-white/[0.06] group-hover:ring-accent/30 transition-all">
                  <img src={getImageUrl(item.poster_path, "w342")} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-xs font-semibold text-yellow-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {item.vote_average}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate px-0.5">{item.title}</h3>
              </Link>
              <button onClick={() => removeItem(item.id)} className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80 translate-y-1 group-hover:translate-y-0">
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
