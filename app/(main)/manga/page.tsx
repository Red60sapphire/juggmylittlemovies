"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, BookOpen, Star, ChevronRight, Ghost, TrendingUp, Trophy, Sparkles, ChevronDown, Globe, BookMarked } from "lucide-react";

interface MangaItem {
  id: string;
  title: string;
  coverUrl: string | null;
  coverColor: string | null;
  description: string;
  rating: number;
  year: number | null;
  status: string;
  tags: string[];
  chapterCount: number;
  volumes: number | null;
  format: string;
  source: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const VIBRANT_GRADIENTS = [
  "from-pink-600/40 via-purple-600/20 to-blue-600/40",
  "from-emerald-600/40 via-teal-600/20 to-cyan-600/40",
  "from-orange-600/40 via-red-600/20 to-pink-600/40",
  "from-blue-600/40 via-indigo-600/20 to-violet-600/40",
  "from-yellow-600/40 via-amber-600/20 to-orange-600/40",
  "from-rose-600/40 via-pink-600/20 to-fuchsia-600/40",
  "from-green-600/40 via-emerald-600/20 to-teal-600/40",
  "from-sky-600/40 via-blue-600/20 to-indigo-600/40",
  "from-purple-600/40 via-violet-600/20 to-fuchsia-600/40",
  "from-cyan-600/40 via-sky-600/20 to-blue-600/40",
];

function getGradient(index: number) {
  return VIBRANT_GRADIENTS[index % VIBRANT_GRADIENTS.length];
}

function CoverImage({ manga, index, className = "" }: { manga: MangaItem; index?: number; className?: string }) {
  const [error, setError] = useState(false);
  const grad = getGradient(index ?? 0);

  if (manga.coverUrl && !error) {
    return (
      <img
        src={manga.coverUrl}
        alt={manga.title}
        loading="lazy"
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${className}`}
      />
    );
  }

  const initials = manga.title.slice(0, 2).toUpperCase();
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${grad} ${className}`}>
      <span className="text-2xl font-black text-white/50">{initials}</span>
      {manga.format && (
        <span className="text-[9px] text-white/30 mt-1 uppercase tracking-wider">{manga.format}</span>
      )}
    </div>
  );
}

function MangaCard({ manga, index }: { manga: MangaItem; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min((index || 0) * 0.025, 0.3) }}
      className="w-[200px] sm:w-[155px] flex-shrink-0"
    >
      <Link href={`/manga/${manga.id}`} className="group block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface mb-1.5 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/50 group-hover:shadow-xl group-hover:shadow-accent/20 group-hover:-translate-y-1">
          <CoverImage manga={manga} index={index} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5 shadow-lg">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {typeof manga.rating === "number" ? manga.rating.toFixed(1) : "?"}
          </div>
          {manga.source && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[9px] font-medium text-white/50 uppercase tracking-wider shadow-lg">
              {manga.source}
            </div>
          )}
        </div>
        <h3 className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors truncate px-0.5 leading-snug">
          {manga.title}
        </h3>
        <div className="flex items-center gap-2 px-0.5 mt-0.5">
          <span className="text-[10px] text-white/40 capitalize">{manga.status?.replace("_", " ") || "unknown"}</span>
          {manga.chapterCount > 0 && (
            <>
              <span className="text-[10px] text-white/20">·</span>
              <span className="text-[10px] text-white/40">{manga.chapterCount} ch.</span>
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function RankedMangaCard({ manga, rank }: { manga: MangaItem; rank: number }) {
  const trophyColor = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : "text-white/[0.07]";
  const trophyIcon = rank <= 3;

  return (
    <Link href={`/manga/${manga.id}`} className="group flex items-end gap-3 min-w-[280px]">
      <div className="relative w-14 flex-shrink-0 text-center">
        {trophyIcon ? (
          <Trophy className={`w-8 h-8 mx-auto ${trophyColor} drop-shadow-lg`} />
        ) : null}
        <span className={`block text-5xl md:text-6xl font-black leading-none select-none transition-colors ${!trophyIcon ? trophyColor : "text-white/[0.07] group-hover:text-accent/30"}`}>
          {rank}
        </span>
      </div>
      <div className="relative w-[120px] flex-shrink-0">
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/50 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-accent/15">
          <CoverImage manga={manga} index={rank} />
        </div>
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5 shadow-lg">
          <Star className="w-2.5 h-2.5 fill-yellow-400" />
          {typeof manga.rating === "number" ? manga.rating.toFixed(1) : "?"}
        </div>
      </div>
      <div className="min-w-0 pb-2">
        <h3 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate leading-tight">{manga.title}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          {manga.tags?.slice(0, 2).map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-accent/10 rounded text-[9px] font-medium text-accent truncate max-w-[60px]">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function MangaHero({ manga }: { manga: MangaItem[] }) {
  const [current, setCurrent] = useState(0);
  const item = manga[current];
  if (!manga.length) return null;

  return (
    <section className="relative w-full h-[55vh] min-h-[420px] md:min-h-[400px] md:h-[52vh] md:max-h-[600px] overflow-hidden rounded-none md:rounded-2xl mb-6 shadow-2xl shadow-black/40">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {item.coverUrl ? (
            <img src={item.coverUrl.replace("large", "extraLarge").replace("256", "512")} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getGradient(current)}`} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />

      <motion.div
        key={item.id}
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
            className="flex items-center gap-2 mb-3 flex-wrap"
          >
            <span className="px-2.5 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full tracking-wider uppercase shadow-lg shadow-accent/20">
              Popular Manga
            </span>
            {item.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                <Star className="w-3 h-3 fill-yellow-400" />{(item.rating).toFixed(1)}
              </span>
            )}
            {item.year && <span className="text-white/40 text-xs">{item.year}</span>}
            {item.source && <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/50 uppercase">{item.source}</span>}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-2xl"
          >
            {item.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-white/50 text-sm line-clamp-2 mb-3 max-w-xl"
          >
            {item.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Link
              href={`/manga/${item.id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 active:scale-95"
            >
              <BookOpen className="w-4 h-4" /> Read Now
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 flex gap-2 z-10">
        {manga.slice(0, 5).map((_, i) => (
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

export default function MangaPage() {
  const [mangaList, setMangaList] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(search, 350);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchManga = useCallback(async (offset: number, query: string) => {
    const params = query ? `&q=${encodeURIComponent(query)}` : "";
    const res = await fetch(`/api/manga?offset=${offset}&limit=30${params}`);
    const data = await res.json();
    return data;
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setMangaList([]);
    setHasMore(true);

    fetchManga(0, debouncedSearch).then((data) => {
      setMangaList(data.manga || []);
      setHasMore((data.manga || []).length >= 20);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [debouncedSearch, fetchManga]);

  useEffect(() => {
    if (loading || !hasMore || debouncedSearch) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const next = page + 30;
          fetchManga(next, "").then((data) => {
            const list = data.manga || [];
            setMangaList((prev) => [...prev, ...list]);
            setHasMore(list.length >= 20);
            setPage(next);
            setLoadingMore(false);
          });
        }
      },
      { rootMargin: "300px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadingMore, debouncedSearch, fetchManga]);

  const topManga = mangaList.slice(0, 10);

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Hero Carousel */}
      {!debouncedSearch && <MangaHero manga={topManga} />}

      {/* Search */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/0 mb-4">
        <div className="relative max-w-md mx-auto md:mx-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manga..."
            className="w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-border rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Top 10 Ranked */}
      {!debouncedSearch && topManga.length > 0 && (
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
            <h2 className="text-lg font-bold text-white tracking-tight">Top 10 Manga</h2>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400/60" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {topManga.map((m, i) => (
              <RankedMangaCard key={m.id} manga={m} rank={i + 1} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Browse Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <BookMarked className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : "Browse Manga"}
          </h2>
          {!loading && (
            <span className="text-xs text-white/40">{mangaList.length} titles</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : mangaList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-vis-auto">
              {mangaList.map((m, i) => (
                <MangaCard key={`${m.id}-${i}`} manga={m} index={i} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-10" />
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-white/30 text-sm">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Loading more...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] rounded-2xl border border-white/[0.06] bg-surface/50">
            <Ghost className="w-12 h-12 text-white/10 mb-4" />
            <h3 className="text-base font-semibold text-white/70">No manga found</h3>
            <p className="text-sm text-white/40 mt-1">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : "No titles available"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
