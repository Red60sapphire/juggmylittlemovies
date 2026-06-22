"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { ANIME_GENRES } from "@/lib/tmdb";
import { getImageUrl, formatRating } from "@/lib/utils";
import {
  Search, Play, Info, Star, ChevronDown, X, TrendingUp, Film,
  Trophy, Sparkles, Clock,
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

function AnimeHero({ movies }: { movies: Movie[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<any>(null);
  const movie = movies[current];

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % Math.min(movies.length, 5));
    }, 5000);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length) startTimer();
    return () => clearInterval(timerRef.current);
  }, [movies.length, startTimer]);

  if (!movies.length) return null;

  return (
    <section
      className="relative w-full h-[65vh] min-h-[500px] md:h-[60vh] md:max-h-[700px] overflow-hidden rounded-none md:rounded-2xl mb-8 shadow-2xl shadow-black/40"
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={() => startTimer()}
    >
      <AnimatePresence mode="wait">
        {movies.slice(0, 5).map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
            style={{ pointerEvents: i === current ? "auto" : "none" }}
          >
            <img
              src={getImageUrl(m.backdrop_path, "original") || ""}
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 via-40% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <motion.div
        key={movie.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-3 mb-3 flex-wrap"
          >
            <span className="px-3 py-1 bg-accent text-white text-[11px] font-bold rounded-full tracking-wider uppercase">
              Featured Anime
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              {formatRating(movie.vote_average)}
            </div>
            {(movie.release_date || movie.first_air_date) && (
              <span className="text-white/50 text-xs">
                {(movie.release_date || movie.first_air_date || "").split("-")[0]}
              </span>
            )}
            <span className="text-white/30 text-xs">•</span>
            <span className="text-white/50 text-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              #{current + 1} Trending
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight leading-tight drop-shadow-lg"
          >
            {movie.title || movie.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-white/50 text-sm line-clamp-2 mb-5 max-w-xl leading-relaxed"
          >
            {movie.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2.5 px-7 py-3.5 md:px-6 md:py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95"
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

      <div className="absolute bottom-5 right-5 md:bottom-8 md:right-10 flex gap-2 z-10">
        {movies.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); clearInterval(timerRef.current); startTimer(); }}
            className={`rounded-full transition-all duration-500 active:scale-90 ${
              i === current
                ? "w-8 h-2 bg-accent shadow-lg shadow-accent/30"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function RankedCard({ movie, rank }: { movie: Movie; rank: number }) {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  return (
    <Link href={`/watch/${movie.id}`} className="group flex items-end gap-3 min-w-[280px]">
      <span className="text-7xl md:text-8xl font-black text-white/10 group-hover:text-accent/20 transition-colors leading-none select-none">
        {rank}
      </span>
      <div className="relative w-[130px] flex-shrink-0">
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-accent/10">
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

  if (loading && !movies.length) return null;
  if (!loading && !movies.length) return null;

  return (
    <HorizontalSlider
      title={genreName}
      items={loading ? Array.from({ length: 10 }) : movies}
      renderCard={(item, i) =>
        loading ? (
          <div key={i} className="w-[150px] aspect-[2/3] rounded-lg bg-surface animate-pulse" />
        ) : (
          <MovieCard movie={item as Movie} index={i} />
        )
      }
    />
  );
}

const GENRE_QUICK_FILTERS = [
  { id: 10759, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 14, name: "Fantasy" },
  { id: 18, name: "Drama" },
  { id: 9648, name: "Mystery" },
  { id: 878, name: "Sci-Fi" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
];

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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (p: number, query: string, genreId: number | null, append: boolean) => {
    let url: string;
    if (query) {
      url = `/api/tmdb/anime?q=${encodeURIComponent(query)}&all=true`;
    } else if (genreId !== null) {
      url = `/api/tmdb/genre?type=tv&id=${genreId}&page=${p}`;
    } else {
      url = `/api/tmdb/anime?page=${p}`;
    }
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  }, []);

  useEffect(() => {
    setLoading(true);
    setIsSearching(!!debouncedSearch);
    setPage(1);
    setBrowseMovies([]);
    setHasMore(true);

    if (debouncedSearch) {
      setIsSearching(true);
      fetchPage(1, debouncedSearch, null, false).then((results) => {
        setBrowseMovies(results);
        setHasMore(false);
        setLoading(false);
      });
    } else if (activeGenre !== null) {
      setIsSearching(false);
      fetchPage(1, "", activeGenre, false).then((results) => {
        setBrowseMovies(results);
        setHasMore(results.length >= 20);
        setLoading(false);
      });
    } else {
      setIsSearching(false);
      fetch("/api/tmdb/anime?all=true").then(r => r.json()).then((data) => {
        const results = data.results || [];
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
          const nextPage = page + 1;
          const url = activeGenre !== null
            ? `/api/tmdb/genre?type=tv&id=${activeGenre}&page=${nextPage}`
            : `/api/tmdb/anime?page=${nextPage}`;
          fetch(url).then(r => r.json()).then((data) => {
            const results = data.results || [];
            if (results.length < 20) setHasMore(false);
            setBrowseMovies((prev) => [...prev, ...results]);
            setPage(nextPage);
            setLoadingMore(false);
          });
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadingMore, debouncedSearch, activeGenre]);

  const movieResults = browseMovies;

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Hero Carousel */}
      {!debouncedSearch && activeGenre === null && <AnimeHero movies={trending} />}

      {/* Search + Genre Filters */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/0 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search anime..."
              className="w-full pl-9 pr-8 py-2.5 bg-white/[0.04] border border-border rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {GENRE_QUICK_FILTERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGenre(activeGenre === g.id ? null : g.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

      {/* Top 10 Ranked Row */}
      {!debouncedSearch && !activeGenre && topRated.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
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

      {/* Genre Rows */}
      {!debouncedSearch && !activeGenre && (
        <div className="space-y-0.5">
          {ANIME_GENRES.slice(0, 6).map((genre) => (
            <AnimeGenreRow key={genre.id} genreId={genre.id} genreName={genre.name} />
          ))}
        </div>
      )}

      {/* Browse Grid */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isSearching
              ? `Results for "${debouncedSearch}"`
              : activeGenre
                ? ANIME_GENRES.find(g => g.id === activeGenre)?.name || "Browse"
                : "Browse All Anime"}
          </h2>
          {!loading && (
            <span className="text-xs text-muted">{movieResults.length} titles</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-surface animate-pulse shimmer" />
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
          <div className="flex flex-col items-center justify-center min-h-[40vh] rounded-xl border border-border bg-surface">
            <Film className="w-12 h-12 text-white/10 mb-4" />
            <h3 className="text-base font-semibold text-white/70">No anime found</h3>
            <p className="text-sm text-muted mt-1">
              {isSearching
                ? `No results for "${debouncedSearch}"`
                : "Try a different genre or check back later"}
            </p>
            {isSearching && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 px-4 py-2 rounded-lg bg-white/[0.06] text-sm text-white/60 hover:text-white transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
