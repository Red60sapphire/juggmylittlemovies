"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { proxyMangaImage } from "@/lib/utils";
import HeroCarousel from "@/components/HeroCarousel";
import type { HeroItem } from "@/components/HeroCarousel";
import { Search, BookOpen, Ghost, TrendingUp, Sparkles, BookMarked } from "lucide-react";

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
        src={proxyMangaImage(manga.coverUrl)!}
        alt={manga.title}
        loading="lazy"
        onError={(e) => { setError(true); (e.target as HTMLImageElement).src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }}
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
  return (
    <Link href={`/manga/${manga.id}`} className="group flex items-end gap-3 min-w-[280px]">
      <div className="flex-shrink-0 w-12 text-center">
        <span className="block text-4xl md:text-5xl font-black leading-none text-white/10 group-hover:text-accent/30 transition-colors select-none">
          {rank}
        </span>
      </div>
      <div className="relative w-[120px] flex-shrink-0">
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/50 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-accent/15">
          <CoverImage manga={manga} index={rank} />
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

function toHeroItems(manga: MangaItem[]): HeroItem[] {
  return manga.map((m) => ({
    id: m.id,
    title: m.title,
    image: proxyMangaImage(m.coverUrl) || "",
    description: m.description,
    year: m.year?.toString(),
    badge: "Popular Manga",
    href: `/manga/${m.id}`,
  }));
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
      {!debouncedSearch && <HeroCarousel items={toHeroItems(topManga)} />}

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
