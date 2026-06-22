"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { getImageUrl, formatRating } from "@/lib/utils";
import {
  Search, Play, Info, Star, X, TrendingUp, Film,
  Trophy, Sparkles, Clock, ChevronDown,
} from "lucide-react";
import Link from "next/link";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

const QUICK_GENRES = [
  { id: 10759, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 14, name: "Fantasy" },
  { id: 18, name: "Drama" },
  { id: 9648, name: "Mystery" },
  { id: 878, name: "Sci-Fi" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
];

function AnimeHero({ movies }: { movies: Movie[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<any>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const movie = movies[current];

  const goTo = useCallback((i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % Math.min(movies.length, 5));
    }, 6000);
  }, [current, movies.length]);

  useEffect(() => {
    if (!movies.length) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % Math.min(movies.length, 5));
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [movies.length]);

  if (!movies.length) return null;

  const containerVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 1.05 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };

  return (
    <div ref={heroRef} className="relative w-full h-[75vh] min-h-[520px] md:h-[70vh] md:max-h-[800px] overflow-hidden rounded-none md:rounded-2xl mb-10 shadow-2xl shadow-black/50">
      <motion.div style={{ y: bgY, scale }} className="absolute inset-0">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={movie.id}
            custom={direction}
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <img
              src={getImageUrl(movie.backdrop_path, "original") || ""}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 via-30% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id + "-content"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 lg:p-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-3 mb-4 flex-wrap"
          >
            <span className="px-3 py-1 bg-accent text-white text-[11px] font-bold rounded-full tracking-wider uppercase shadow-lg shadow-accent/20">
              Featured
            </span>
            <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-bold">
              <Star className="w-4 h-4 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </div>
            {(movie.release_date || movie.first_air_date) && (
              <span className="text-white/50 text-sm">
                {(movie.release_date || movie.first_air_date || "").split("-")[0]}
              </span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight leading-[1.1] drop-shadow-2xl max-w-3xl"
          >
            {movie.title || movie.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-white/50 text-sm md:text-base line-clamp-2 mb-6 max-w-xl leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2.5 px-8 py-4 md:px-6 md:py-3 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Now
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center gap-2.5 px-7 py-4 md:px-5 md:py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Info className="w-5 h-5" />
              Details
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-5 right-5 md:bottom-8 md:right-10 flex gap-2.5 z-10">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-500 active:scale-90 ${
              i === current
                ? "w-9 h-2.5 bg-accent shadow-lg shadow-accent/40"
                : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-5 left-5 md:bottom-8 md:left-10 z-10 hidden sm:block">
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-white/30"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </div>
  );
}

function RankedCard({ movie, rank }: { movie: Movie; rank: number }) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  return (
    <Link href={`/watch/${movie.id}`} className="group flex items-end gap-3 min-w-[280px]">
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-7xl md:text-8xl font-black text-white/[0.07] group-hover:text-accent/15 transition-colors leading-none select-none"
      >
        {rank}
      </motion.span>
      <div className="relative w-[130px] flex-shrink-0">
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-accent/10">
          <img
            src={getImageUrl(movie.poster_path, "w185") || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-yellow-400" />
          {formatRating(movie.vote_average)}
        </div>
        {year && (
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] text-white/60 font-medium">
            {year}
          </div>
        )}
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
    setLoading(true);
    fetch(`/api/tmdb/genre?type=tv&id=${genreId}&all=true`)
      .then((r) => r.json())
      .then((data) => setMovies(data.results || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [genreId]);

  if (loading && !movies.length) return (
    <div className="mb-8 md:mb-6">
      <div className="h-5 w-32 bg-white/[0.04] rounded-lg animate-pulse mb-3" />
      <div className="flex gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-[150px] aspect-[2/3] rounded-lg bg-surface animate-pulse flex-shrink-0" />
        ))}
      </div>
    </div>
  );

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
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (p: number, query: string, genreId: number | null) => {
    if (query) {
      const r = await fetch(`/api/tmdb/anime?q=${encodeURIComponent(query)}&all=true`);
      if (!r.ok) return [];
      const d = await r.json();
      return d.results || [];
    }
    if (genreId !== null) {
      const r = await fetch(`/api/tmdb/genre?type=tv&id=${genreId}&page=${p}`);
      if (!r.ok) return [];
      const d = await r.json();
      return d.results || [];
    }
    const r = await fetch(`/api/tmdb/anime?page=${p}`);
    if (!r.ok) return [];
    const d = await r.json();
    return d.results || [];
  }, []);

  useEffect(() => {
    setLoading(true);
    setIsSearching(!!debouncedSearch);
    setPage(1);
    setBrowseMovies([]);
    setHasMore(true);

    if (debouncedSearch) {
      setIsSearching(true);
      fetchPage(1, debouncedSearch, null).then((r) => {
        setBrowseMovies(r);
        setHasMore(false);
        setLoading(false);
      });
    } else if (activeGenre !== null) {
      setIsSearching(false);
      fetchPage(1, "", activeGenre).then((r) => {
        setBrowseMovies(r);
        setHasMore(r.length >= 20);
        setLoading(false);
      });
    } else {
      setIsSearching(false);
      fetch("/api/tmdb/anime?all=true").then(r => r.json()).then((d) => {
        const results = d.results || [];
        setTrending(results.slice(0, 5));
        setTopRated(results.slice(0, 10));
        setBrowseMovies(results);
        setHasMore(results.length >= 20);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [debouncedSearch, activeGenre]);

  useEffect(() => {
    if (loading || !hasMore || debouncedSearch) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const next = page + 1;
          fetchPage(next, "", activeGenre).then((r) => {
            if (r.length < 20) setHasMore(false);
            setBrowseMovies((prev) => [...prev, ...r]);
            setPage(next);
            setLoadingMore(false);
          });
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadingMore, debouncedSearch, activeGenre, fetchPage]);

  const movieResults = browseMovies;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      {!debouncedSearch && activeGenre === null && <AnimeHero movies={trending} />}

      {/* Search bar */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/0 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search anime..."
              className="w-full pl-10 pr-9 py-2.5 bg-white/[0.04] border border-border rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {QUICK_GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGenre(activeGenre === g.id ? null : g.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeGenre === g.id
                    ? "bg-accent text-white shadow-sm shadow-accent/20"
                    : "bg-white/[0.04] text-white/50 hover:text-white/80 hover:bg-white/[0.08]"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 */}
      {!debouncedSearch && !activeGenre && topRated.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-lg font-bold text-white tracking-tight">Top 10 Anime</h2>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400/60" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {topRated.slice(0, 10).map((movie, i) => (
              <RankedCard key={movie.id} movie={movie} rank={i + 1} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Genre rows */}
      {!debouncedSearch && !activeGenre && (
        <div className="space-y-1">
          {GENRES.slice(0, 6).map((genre) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4 }}
            >
              <AnimeGenreRow genreId={genre.id} genreName={genre.name} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Browse Grid */}
      <section className="mt-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <Film className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isSearching
              ? `"${debouncedSearch}"`
              : activeGenre
                ? GENRES.find(g => g.id === activeGenre)?.name || "Browse"
                : "Browse All Anime"}
          </h2>
          {!loading && (
            <span className="text-xs text-white/40">{movieResults.length} titles</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : movieResults.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-vis-auto">
              {movieResults.map((movie, i) => (
                <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-10" />
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-white/30 text-sm">
                  <Clock className="w-4 h-4 animate-spin" />
                  Loading more...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] rounded-2xl border border-white/[0.06] bg-surface/50">
            <Film className="w-12 h-12 text-white/10 mb-4" />
            <h3 className="text-base font-semibold text-white/70">No anime found</h3>
            <p className="text-sm text-white/40 mt-1">
              {isSearching ? `No results for "${debouncedSearch}"` : "Try a different genre"}
            </p>
            {isSearching && (
              <button onClick={() => setSearch("")} className="mt-4 px-5 py-2 rounded-xl bg-white/[0.06] text-sm text-white/60 hover:text-white transition-colors">
                Clear search
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
