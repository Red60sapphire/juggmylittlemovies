"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { ANIME_GENRES } from "@/lib/tmdb";
import { getImageUrl, formatRating } from "@/lib/utils";
import { Search, Play, Info, Star, ChevronDown, Ghost, TrendingUp, Film } from "lucide-react";
import Link from "next/link";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function AnimeHero({ movies }: { movies: Movie[] }) {
  const [current, setCurrent] = useState(0);
  const movie = movies[current];

  if (!movies.length) return null;

  return (
    <section className="relative w-full h-[60vh] min-h-[480px] md:min-h-[400px] md:h-[55vh] md:max-h-[650px] overflow-hidden rounded-none md:rounded-2xl mb-6 shadow-2xl shadow-black/30">
      <AnimatePresence mode="wait">
        {movies.slice(0, 5).map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ pointerEvents: i === current ? "auto" : "none" }}
          >
            <img src={getImageUrl(m.backdrop_path, "original") || ""} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

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
            <span className="px-2.5 py-0.5 bg-accent/90 text-white text-[10px] font-bold rounded-full tracking-wider uppercase">
              Trending Anime
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
              <Star className="w-3 h-3 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight leading-tight"
          >
            {movie.title || movie.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-white/50 text-sm line-clamp-2 mb-4 max-w-xl leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex items-center gap-2.5 flex-wrap"
          >
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2.5 px-7 py-3.5 md:px-6 md:py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2.5 px-6 py-3.5 md:px-4 md:py-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Info className="w-5 h-5" />
              Details
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 flex gap-2 z-10">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 active:scale-90 ${
              i === current ? "w-8 bg-accent" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function RankedCard({ movie, rank }: { movie: Movie; rank: number }) {
  const title = movie.title || movie.name || "Untitled";
  return (
    <Link href={`/watch/${movie.id}`} className="group flex items-end gap-3 min-w-[280px]">
      <span className="text-6xl md:text-7xl font-black text-white/10 group-hover:text-accent/30 transition-colors leading-none select-none">
        {rank}
      </span>
      <div className="relative w-[120px] flex-shrink-0">
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:-translate-y-1">
          <img
            src={getImageUrl(movie.poster_path, "w185") || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-yellow-400" />
          {formatRating(movie.vote_average)}
        </div>
      </div>
      <div className="min-w-0 pb-1">
        <h3 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate leading-tight">{title}</h3>
      </div>
    </Link>
  );
}

function AnimeGenreRow({ genreId, genreName }: { genreId: number; genreName: string }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tmdb/genre?type=tv&id=${genreId}&all=true`)
      .then((r) => r.json())
      .then((data) => setMovies(data.results || []))
      .finally(() => setLoading(false));
  }, [genreId]);

  if (loading) return null;
  if (!movies.length) return null;

  return (
    <HorizontalSlider
      title={genreName}
      items={movies}
      renderCard={(movie, i) => <MovieCard movie={movie} index={i} />}
    />
  );
}

export default function AnimePage() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [browseMovies, setBrowseMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(search, 350);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (p: number, query: string, append: boolean) => {
    if (query) {
      const params = `q=${encodeURIComponent(query)}&all=true`;
      const res = await fetch(`/api/tmdb/anime?${params}`);
      const data = await res.json();
      return data.results || [];
    }
    const res = await fetch(`/api/tmdb/anime?page=${p}`);
    const data = await res.json();
    return data.results || [];
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setBrowseMovies([]);
    setHasMore(true);

    if (!debouncedSearch) {
      Promise.all([
        fetch("/api/tmdb/trending").then(r => r.json()),
        fetch("/api/tmdb/anime?all=true").then(r => r.json()),
        fetchPage(1, "", false),
      ]).then(([trendData, browseData, firstPage]) => {
        const allTitles = browseData.results || browseData;
        const animeFiltered = (trendData.results || []).filter((r: any) => {
          const gids: number[] = r.genre_ids || [];
          const oc: string[] = r.origin_country || [];
          return gids.includes(16) && (oc.includes("JP") || r.original_language === "ja");
        });
        setTrending(animeFiltered.slice(0, 10));
        setTopRated(allTitles.slice(0, 10));
        setBrowseMovies(firstPage);
        setHasMore(firstPage.length >= 20);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      fetchPage(1, debouncedSearch, false).then((results) => {
        setBrowseMovies(results);
        setHasMore(false);
        setLoading(false);
      });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (loading || !hasMore || debouncedSearch) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          fetchPage(nextPage, "", true).then((results) => {
            if (results.length < 20) setHasMore(false);
            setBrowseMovies((prev) => [...prev, ...results]);
            setPage(nextPage);
            setLoadingMore(false);
          });
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, page, loadingMore, debouncedSearch, fetchPage]);

  const movieResults = browseMovies;

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Hero Carousel */}
      <AnimeHero movies={trending} />

      {/* Search Bar */}
      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anime..."
          className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-border rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all"
        />
      </div>

      {/* Top 10 Ranked Row */}
      {!debouncedSearch && topRated.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-lg font-bold text-white tracking-tight">Top 10 Anime</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {topRated.slice(0, 10).map((movie, i) => (
              <RankedCard key={movie.id} movie={movie} rank={i + 1} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Genre Rows */}
      {!debouncedSearch && (
        <div className="space-y-0.5">
          {ANIME_GENRES.map((genre) => (
            <AnimeGenreRow key={genre.id} genreId={genre.id} genreName={genre.name} />
          ))}
        </div>
      )}

      {/* Browse Grid with Infinite Scroll */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : "Browse All Anime"}
          </h2>
          {!loading && (
            <span className="text-xs text-muted">{movieResults.length} titles</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        ) : movieResults.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movieResults.map((movie, i) => (
                <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-10" />
            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] rounded-xl border border-border bg-surface">
            <Ghost className="w-10 h-10 text-white/15 mb-3" />
            <h3 className="text-base font-semibold text-white/70">No anime found</h3>
            <p className="text-sm text-muted mt-0.5">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : "No titles available"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
