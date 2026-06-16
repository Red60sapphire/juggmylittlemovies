"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getImageUrl,
  formatRating,
  getBackdropUrl,
  cn,
} from "@/lib/utils";
import {
  Play,
  Shuffle,
  Star,
  Calendar,
  Film,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
} from "lucide-react";

interface CollectionPart {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface CollectionData {
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: CollectionPart[];
}

const SIMILAR_COLLECTIONS = [
  { id: 10, name: "Star Wars" },
  { id: 1241, name: "Harry Potter" },
  { id: 119, name: "Lord of the Rings" },
  { id: 86311, name: "Marvel Cinematic Universe" },
  { id: 328, name: "Jurassic Park" },
];

type SortKey = "release_date" | "vote_average" | "title";

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("release_date");
  const [similarCollections, setSimilarCollections] = useState<
    { id: number; name: string; backdrop_path: string | null; parts: CollectionPart[] }[]
  >([]);
  const similarRowRef = useRef<HTMLDivElement>(null);

  const collectionId = parseInt(params.id as string);

  useEffect(() => {
    setLoading(true);
    setSortBy("release_date");

    Promise.all([
      fetch(`/api/tmdb/collection/${collectionId}`).then((r) => r.json()),
      ...SIMILAR_COLLECTIONS.filter((c) => c.id !== collectionId)
        .slice(0, 4)
        .map((c) =>
          fetch(`/api/tmdb/collection/${c.id}`)
            .then((r) => r.json())
            .then((data) => ({ id: c.id, name: c.name, ...data }))
        ),
    ])
      .then(([main, ...similar]) => {
        setCollection(main);
        setSimilarCollections(
          similar.filter((s: any) => s.parts?.length > 0) as any
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collectionId]);

  const sortedMovies = useMemo(() => {
    if (!collection?.parts) return [];
    const movies = [...collection.parts];
    switch (sortBy) {
      case "release_date":
        return movies.sort(
          (a, b) =>
            new Date(a.release_date || "0").getTime() -
            new Date(b.release_date || "0").getTime()
        );
      case "vote_average":
        return movies.sort((a, b) => b.vote_average - a.vote_average);
      case "title":
        return movies.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return movies;
    }
  }, [collection?.parts, sortBy]);

  const stats = useMemo(() => {
    if (!collection?.parts?.length)
      return { count: 0, yearMin: "", yearMax: "", avgRating: 0 };
    const movies = collection.parts;
    const years = movies
      .map((m) => m.release_date?.split("-")[0])
      .filter(Boolean) as string[];
    const yearMin = years.length ? Math.min(...years.map(Number)).toString() : "";
    const yearMax = years.length ? Math.max(...years.map(Number)).toString() : "";
    const avgRating =
      movies.reduce((sum, m) => sum + (m.vote_average || 0), 0) / movies.length;
    return {
      count: movies.length,
      yearMin,
      yearMax,
      avgRating: isNaN(avgRating) ? 0 : avgRating,
    };
  }, [collection?.parts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-white/40">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection?.name) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-white/30" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Collection not found</h1>
          <p className="text-sm text-white/40 mb-6">
            This collection doesn&apos;t exist or couldn&apos;t be loaded.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </motion.button>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full min-h-[60vh] rounded-2xl overflow-hidden mb-10"
      >
        <div className="absolute inset-0">
          {collection.backdrop_path && (
            <img
              src={getBackdropUrl(collection.backdrop_path) || ""}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/50 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-end min-h-[60vh] p-8 md:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent/90 text-white text-xs font-bold rounded-full tracking-wider uppercase mb-4">
              <Film className="w-3.5 h-3.5" />
              Collection
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
              {collection.name}
            </h1>

            <p className="text-sm text-white/40 mb-2">
              {stats.count} {stats.count === 1 ? "movie" : "movies"} in this collection
            </p>

            {collection.overview && (
              <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-xl mb-6 line-clamp-3">
                {collection.overview}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap mb-8">
              <Link
                href={`/watch/${sortedMovies[0]?.id}`}
                className="flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                Play Collection
              </Link>
              <button
                onClick={() => {
                  const random =
                    sortedMovies[Math.floor(Math.random() * sortedMovies.length)];
                  if (random) router.push(`/watch/${random.id}`);
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/10 transition-all active:scale-95"
              >
                <Shuffle className="w-5 h-5" />
                Shuffle
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center gap-6 mb-8 px-1"
      >
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Film className="w-4 h-4 text-accent" />
          <span className="font-semibold text-white">{stats.count}</span>
          <span>{stats.count === 1 ? "Movie" : "Movies"}</span>
        </div>
        {(stats.yearMin || stats.yearMax) && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="w-4 h-4 text-accent" />
            <span>
              {stats.yearMin} &mdash; {stats.yearMax}
            </span>
          </div>
        )}
        {stats.avgRating > 0 && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Star className="w-4 h-4 text-accent" />
            <span className="font-semibold text-white">
              {formatRating(stats.avgRating)}
            </span>
            <span>Average Rating</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 mb-6"
      >
        <span className="text-sm text-white/50">Sort By:</span>
        {[
          { key: "release_date" as SortKey, label: "Release Date" },
          { key: "vote_average" as SortKey, label: "Rating" },
          { key: "title" as SortKey, label: "Title A-Z" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-medium transition-all border",
              sortBy === opt.key
                ? "bg-accent/15 border-accent/40 text-accent"
                : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70"
            )}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
        {sortedMovies.map((movie, i) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          >
            <Link
              href={`/watch/${movie.id}`}
              className="group block"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-card mb-2 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-accent/10 group-hover:scale-[1.02]">
                <img
                  src={getImageUrl(movie.poster_path, "w342")}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </span>
                    <span className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                      <Info className="w-3.5 h-3.5 text-white" />
                    </span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[11px] font-bold text-yellow-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {formatRating(movie.vote_average)}
                  </span>
                </div>

                {movie.release_date && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[11px] text-white/70 font-medium">
                    {movie.release_date.split("-")[0]}
                  </div>
                )}
              </div>
              <p className="text-xs text-white/40 mb-0.5 px-0.5">Movie</p>
              <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate px-0.5">
                {movie.title}
              </h3>
            </Link>
          </motion.div>
        ))}
      </div>

      {similarCollections.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              You May Also Like
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!similarRowRef.current) return;
                  similarRowRef.current.scrollBy({
                    left: -similarRowRef.current.clientWidth * 0.75,
                    behavior: "smooth",
                  });
                }}
                className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => {
                  if (!similarRowRef.current) return;
                  similarRowRef.current.scrollBy({
                    left: similarRowRef.current.clientWidth * 0.75,
                    behavior: "smooth",
                  });
                }}
                className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <div
            ref={similarRowRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {similarCollections.map((col, i) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex-shrink-0 w-[260px] snap-start"
              >
                <Link
                  href={`/collection/${col.id}`}
                  className="group block"
                >
                  <div className="relative h-[160px] rounded-2xl overflow-hidden bg-card border border-white/[0.06] transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-lg group-hover:shadow-accent/10">
                    {col.backdrop_path && (
                      <img
                        src={getBackdropUrl(col.backdrop_path) || ""}
                        alt={col.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                        {col.name}
                      </h3>
                      <span className="text-xs text-white/50 mt-1 block">
                        {col.parts?.length || 0} movies
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
