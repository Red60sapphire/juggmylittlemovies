"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import { getImageUrl, formatRating } from "@/lib/utils";
import { Play, Info, Star, TrendingUp, Film, Tv, Sparkles, ChevronRight } from "lucide-react";
import type { Movie } from "@/types";

function HeroBannerFallback() {
  return (
    <div className="relative w-full h-[60vh] min-h-[480px] md:min-h-[400px] md:h-[55vh] md:max-h-[650px] rounded-none md:rounded-2xl overflow-hidden bg-gradient-to-br from-accent/10 via-background to-background flex items-center justify-center">
      <div className="text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight"
        >
          Welcome to Stremer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/50 text-lg max-w-md mx-auto mb-8"
        >
          Stream movies, TV shows, anime, and manga
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <Link href="/trending" className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 active:scale-95">
            Explore Trending
          </Link>
          <Link href="/anime" className="px-8 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition-all active:scale-95">
            Browse Anime
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function TrendingHero({ movies }: { movies: Movie[] }) {
  const [current, setCurrent] = useState(0);
  const movie = movies[current];

  useEffect(() => {
    if (!movies.length) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % Math.min(movies.length, 5)), 7000);
    return () => clearInterval(t);
  }, [movies.length]);

  if (!movies.length) return <HeroBannerFallback />;

  return (
    <section className="relative w-full h-[60vh] min-h-[480px] md:min-h-[400px] md:h-[55vh] md:max-h-[650px] overflow-hidden rounded-none md:rounded-2xl mb-8 md:mb-6 shadow-2xl shadow-black/30">
      {movies.slice(0, 5).map((m, i) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-all duration-[1200ms] ${i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
        >
          <img src={getImageUrl(m.backdrop_path, "original") || ""} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />

      <motion.div
        key={movie.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-10"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-2 mb-3"
          >
            <span className="px-2.5 py-0.5 bg-accent/90 text-white text-[10px] font-bold rounded-full tracking-wider uppercase shadow-lg shadow-accent/20">
              Trending Now
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
              <Star className="w-3 h-3 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </div>
            {(movie.release_date || movie.first_air_date) && (
              <span className="text-white/40 text-xs">{(movie.release_date || movie.first_air_date || "").split("-")[0]}</span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-2xl"
          >
            {movie.title || movie.name || "Untitled"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-white/50 text-sm line-clamp-2 mb-4 max-w-xl"
          >
            {movie.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex items-center gap-3"
          >
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" /> Watch Now
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Info className="w-4 h-4" /> Details
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 flex gap-2 z-10">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-accent shadow-lg shadow-accent/40" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function QuickLinks() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[
        { href: "/movies", label: "Movies", icon: Film, color: "from-blue-600/20 to-blue-900/10" },
        { href: "/tv-shows", label: "TV Shows", icon: Tv, color: "from-purple-600/20 to-purple-900/10" },
        { href: "/anime", label: "Anime", icon: Sparkles, color: "from-pink-600/20 to-pink-900/10" },
        { href: "/manga", label: "Manga", icon: TrendingUp, color: "from-green-600/20 to-green-900/10" },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group relative overflow-hidden rounded-2xl glass glass-border p-5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
          <div className="relative z-10">
            <item.icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors mb-2" />
            <h3 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{item.label}</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-white/40 group-hover:text-accent transition-colors">
              Browse <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function DataRow({ title, fetchFn }: { title: string; fetchFn: () => Promise<Movie[]> }) {
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

  return (
    <div className="space-y-1 md:space-y-0 animate-fade-in">
      <TrendingHero movies={trending} />
      <QuickLinks />

      <DataRow
        title="Trending Now"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?all=true");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <DataRow
        title="Popular Movies"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?type=popular&all=true");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <DataRow
        title="Top Rated"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?type=top_rated");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <DataRow
        title="Popular TV Shows"
        fetchFn={useCallback(async () => {
          const r = await fetch("/api/tmdb/trending?type=trending_tv&all=true");
          const d = await r.json();
          return d.results || [];
        }, [])}
      />

      <section className="mt-6 mb-4">
        <Link
          href="/trending"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl glass glass-border hover:bg-white/[0.06] text-sm font-semibold text-white/60 hover:text-white transition-all group"
        >
          View All Trending <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
