"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MangaTitle } from "@/lib/mangadex";
import { MANGA_GENRES } from "@/lib/mangadex";
import { Search, BookOpen, Star, ChevronRight, Ghost, TrendingUp, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function MangaCard({ manga, index }: { manga: MangaTitle; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min((index || 0) * 0.03, 0.3) }}
      className="w-[200px] sm:w-[150px]"
    >
      <Link href={`/manga/${manga.id}`} className="group block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface mb-1.5 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:shadow-xl group-hover:shadow-accent/15 group-hover:-translate-y-1">
          {manga.coverUrl ? (
            <img
              src={manga.coverUrl}
              alt={manga.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {manga.rating.toFixed(1)}
          </div>
        </div>
        <h3 className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate px-0.5 leading-snug">
          {manga.title}
        </h3>
        <p className="text-[10px] text-muted px-0.5 truncate">{manga.status}</p>
      </Link>
    </motion.div>
  );
}

function RankedMangaCard({ manga, rank }: { manga: MangaTitle; rank: number }) {
  return (
    <Link href={`/manga/${manga.id}`} className="group flex items-end gap-3 min-w-[280px]">
      <span className="text-6xl md:text-7xl font-black text-white/10 group-hover:text-accent/30 transition-colors leading-none select-none">
        {rank}
      </span>
      <div className="relative w-[120px] flex-shrink-0">
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:-translate-y-1">
          {manga.coverUrl ? (
            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-white/20" /></div>
          )}
        </div>
        <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-yellow-400" />
          {manga.rating.toFixed(1)}
        </div>
      </div>
      <div className="min-w-0 pb-1">
        <h3 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate leading-tight">{manga.title}</h3>
      </div>
    </Link>
  );
}

function MangaHero({ manga }: { manga: MangaTitle[] }) {
  const [current, setCurrent] = useState(0);
  const item = manga[current];
  if (!manga.length) return null;

  return (
    <section className="relative w-full h-[50vh] min-h-[400px] md:min-h-[380px] md:h-[50vh] md:max-h-[550px] overflow-hidden rounded-none md:rounded-2xl mb-6 shadow-2xl shadow-black/30">
      {manga.slice(0, 5).map((m, i) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          {m.coverUrl ? (
            <img src={m.coverUrl.replace(".256.", ".512.")} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : null}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-10"
      >
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="px-2.5 py-0.5 bg-accent/90 text-white text-[10px] font-bold rounded-full tracking-wider uppercase inline-block mb-3"
          >
            Popular Manga
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all"
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
              i === current ? "w-8 bg-accent" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default function MangaPage() {
  const [mangaList, setMangaList] = useState<MangaTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(search, 350);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchManga = useCallback(async (offset: number, query: string, append: boolean) => {
    const params = query ? `&title=${encodeURIComponent(query)}` : "";
    const res = await fetch(`/api/manga?offset=${offset}&limit=20${params}`);
    const data = await res.json();
    return data;
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setMangaList([]);
    setHasMore(true);

    fetchManga(0, debouncedSearch, false).then((data) => {
      setMangaList(data.manga || []);
      setHasMore((data.manga || []).length >= 20);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [debouncedSearch]);

  useEffect(() => {
    if (loading || !hasMore || debouncedSearch) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const next = page + 20;
          fetchManga(next, "", true).then((data) => {
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
      <MangaHero manga={topManga} />

      {/* Search */}
      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search manga..."
          className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-border rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all"
        />
      </div>

      {/* Top 10 */}
      {!debouncedSearch && topManga.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-lg font-bold text-white tracking-tight">Top 10 Manga</h2>
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
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : "Browse Manga"}
          </h2>
          {!loading && (
            <span className="text-xs text-muted">{mangaList.length} titles</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        ) : mangaList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-vis-auto">
              {mangaList.map((m, i) => (
                <MangaCard key={m.id} manga={m} index={i} />
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
            <h3 className="text-base font-semibold text-white/70">No manga found</h3>
            <p className="text-sm text-muted mt-0.5">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : "No titles available"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
