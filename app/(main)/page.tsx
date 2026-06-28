"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import HeroCarousel from "@/components/HeroCarousel";
import { getImageUrl, formatRating } from "@/lib/utils";
import { TrendingUp, Film, Tv, Sparkles, ChevronRight } from "lucide-react";
import type { Movie } from "@/types";
import type { HeroItem } from "@/components/HeroCarousel";

function toHeroItems(movies: Movie[]): HeroItem[] {
  return movies.map((m) => ({
    id: m.id,
    title: m.title || m.name || "Untitled",
    image: getImageUrl(m.backdrop_path, "original") || "",
    rating: formatRating(m.vote_average || 0),
    year: (m.release_date || m.first_air_date || "").split("-")[0],
    badge: "Trending Now",
    description: m.overview,
    href: `/watch/movie/${m.id}`,
  }));
}

function QuickLinks() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[
        { href: "/movies", label: "Movies", icon: Film, gradient: "from-blue-600 via-indigo-600 to-purple-700", shadow: "shadow-blue-600/20" },
        { href: "/tv-shows", label: "TV Shows", icon: Tv, gradient: "from-purple-600 via-pink-600 to-rose-700", shadow: "shadow-purple-600/20" },
        { href: "/anime", label: "Anime", icon: Sparkles, gradient: "from-pink-500 via-rose-500 to-red-600", shadow: "shadow-pink-600/20" },
        { href: "/manga", label: "Manga", icon: TrendingUp, gradient: "from-emerald-500 via-teal-500 to-cyan-600", shadow: "shadow-emerald-600/20" },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${item.shadow} hover:shadow-xl`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-white/[0.01] ring-1 ring-white/[0.06] rounded-2xl" />
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-10 blur-2xl rounded-full group-hover:opacity-25 transition-opacity" />
          <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 shadow-lg`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">{item.label}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-white/40 group-hover:text-white/70 transition-colors">
              Browse now <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function DataRow({ title, fetchFn, accentColor }: { title: string; fetchFn: () => Promise<Movie[]>; accentColor?: string }) {
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFn().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [fetchFn]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="h-5 w-40 bg-white/[0.04] rounded-lg animate-pulse mb-3" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[150px] aspect-[2/3] rounded-lg bg-surface animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <HorizontalSlider
      title={title}
      items={items}
      accentColor={accentColor}
      renderCard={(movie, i) => <MovieCard movie={movie} index={i} />}
    />
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/tmdb/trending")
      .then((r) => r.json())
      .then((d) => setTrending(d.results?.slice(0, 5) || []))
      .catch(() => {});
  }, []);

  const heroItems = toHeroItems(trending);

  return (
    <div className="space-y-1 md:space-y-0 animate-fade-in">
      {heroItems.length > 0 ? (
        <HeroCarousel items={heroItems} />
      ) : (
        <section className="relative w-full h-[60vh] min-h-[480px] md:h-[55vh] md:max-h-[650px] rounded-none md:rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 via-background to-background flex items-center justify-center mb-8 md:mb-6">
          <div className="text-center px-6">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Welcome to juggmylittlemovies
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="text-white/50 text-lg max-w-md mx-auto mb-8">
              Stream movies, TV shows, anime, and manga
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/trending" className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 active:scale-95">Explore Trending</Link>
              <Link href="/anime" className="px-8 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition-all active:scale-95">Browse Anime</Link>
            </motion.div>
          </div>
        </section>
      )}
      <QuickLinks />

      <DataRow
        title="Trending Now"
        accentColor="bg-accent-pink"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?all=true");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <DataRow
        title="Popular Movies"
        accentColor="bg-accent-amber"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?type=popular&all=true");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <DataRow
        title="Top Rated"
        accentColor="bg-accent-rose"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?type=top_rated");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <DataRow
        title="Popular TV Shows"
        accentColor="bg-accent-cyan"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?type=trending_tv&all=true");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <section className="mt-8 mb-4">
        <Link
          href="/trending"
          className="group relative flex items-center justify-center gap-2 w-full py-4 rounded-2xl overflow-hidden text-sm font-semibold transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-rose/10 via-accent/10 to-accent-cyan/10 ring-1 ring-white/[0.06] rounded-2xl group-hover:from-accent-rose/20 group-hover:via-accent/20 group-hover:to-accent-cyan/20 transition-all duration-500" />
          <span className="relative text-white/70 group-hover:text-white transition-colors">View All Trending</span>
          <ChevronRight className="relative w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>
      </section>
    </div>
  );
}
