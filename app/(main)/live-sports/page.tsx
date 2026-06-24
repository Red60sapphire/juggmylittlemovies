"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Search, ChevronRight, Tv, Wifi } from "lucide-react";
import { SPORT_CATEGORIES, SPORTS_CHANNELS, isSportInSeason, type SportChannel } from "@/lib/sports";

function SportChannelCard({ channel, index }: { channel: SportChannel; index: number }) {
  const inSeason = isSportInSeason(channel.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.4) }}
    >
      <Link
        href={`/watch/sports/${channel.id}`}
        className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/20 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center flex-shrink-0 ring-1 ring-white/5 group-hover:ring-amber-500/30 transition-all">
          <Tv className="w-5 h-5 text-amber-400/60" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors truncate">{channel.name}</p>
          <p className="text-[10px] mt-0.5">{inSeason ? "In season" : "Off season"}</p>
        </div>
        <div className="flex items-center gap-2">
          {inSeason ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          )}
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-all group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function LiveSportsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = SPORTS_CHANNELS;
    if (activeCategory) {
      list = list.filter(c => c.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, search]);

  const categories = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return SPORT_CATEGORIES.filter(cat =>
        cat.name.toLowerCase().includes(q) ||
        SPORTS_CHANNELS.some(c => c.category === cat.id && c.name.toLowerCase().includes(q))
      );
    }
    return SPORT_CATEGORIES;
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Live Sports</h1>
            <p className="text-xs text-white/40 mt-0.5">{SPORTS_CHANNELS.length} channels</p>
          </div>
        </div>
        <p className="text-sm text-white/40 mt-2 max-w-lg">
          Watch live sports streams from around the world. If a channel doesn&apos;t load, try another or refresh.
        </p>
      </motion.div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory(null); }}
          placeholder="Search sports..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/15 outline-none focus:border-accent/40 transition-all"
        />
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
            !activeCategory
              ? "bg-white/10 border-white/20 text-white"
              : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white/70"
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white/70"
            }`}
          >
            <span className="text-[11px]">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Tv className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No channels found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filtered.map((channel, i) => (
            <SportChannelCard key={channel.id} channel={channel} index={i} />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Wifi className="w-3.5 h-3.5" />
          Streams auto-fallback to the next available source. Use an ad blocker for the best experience.
        </div>
      </div>
    </div>
  );
}
