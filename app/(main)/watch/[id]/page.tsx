"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getServersForMovie } from "@/lib/servers";
import { getImageUrl, formatRating, formatDate, cn } from "@/lib/utils";
import { addToLocalHistory } from "@/lib/localHistory";
import type { VideoSource } from "@/types";
import {
  Play,
  ArrowLeft,
  Monitor,
  Star,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  Tv,
} from "lucide-react";

interface MovieData {
  id: number;
  title: string;
  name?: string;
  overview?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
}

const genreColors: Record<string, string> = {
  Action: "bg-red-500/20 text-red-300 border-red-500/30",
  Adventure: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Comedy: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Drama: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Horror: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Romance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Sci-Fi": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Thriller: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Documentary: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Animation: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Family: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Fantasy: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  Mystery: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  War: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  Music: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  History: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Western: "bg-neutral-500/20 text-neutral-300 border-neutral-500/30",
  Crime: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

function formatRuntime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [servers, setServers] = useState<VideoSource[]>([]);
  const [currentServer, setCurrentServer] = useState<VideoSource | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showServerList, setShowServerList] = useState(false);

  useEffect(() => {
    const id = parseInt(params.id as string);
    const availableServers = getServersForMovie(id);
    setServers(availableServers);
    setCurrentServer(availableServers[0]);

    fetch(`/api/tmdb/movie/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data);
        addToLocalHistory(
          id,
          data.title || data.name || "Unknown",
          data.poster_path,
          data.backdrop_path
        );
      })
      .catch(() => {});
  }, [params.id]);

  const handleServerChange = (server: VideoSource) => {
    setCurrentServer(server);
    setIframeLoaded(false);
    setIframeError(false);
    setShowServerList(false);
  };

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-white/40">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/[0.06]"
      >
        {movie.backdrop_path && (
          <div className="absolute inset-0 -z-10">
            <img
              src={getImageUrl(movie.backdrop_path, "original")}
              alt=""
              className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
            />
          </div>
        )}

        <div className="relative aspect-video bg-black/80">
          {currentServer && (
            <>
              <AnimatePresence mode="wait">
                <motion.iframe
                  key={currentServer.url}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: iframeLoaded ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  src={currentServer.url}
                  className="w-full h-full"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  allow="autoplay; fullscreen"
                  onLoad={() => {
                    setIframeLoaded(true);
                    setIframeError(false);
                  }}
                  onError={() => setIframeError(true)}
                />
              </AnimatePresence>

              {!iframeLoaded && !iframeError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-white/40">Loading stream...</p>
                </div>
              )}

              {iframeError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-8">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-white/60 text-sm max-w-xs">
                    This server failed to load. Try another server below.
                  </p>
                </div>
              )}
            </>
          )}

          {!currentServer && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Play className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 text-sm max-w-xs">
                No streaming sources available for this title.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {movie.title || movie.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {movie.vote_average ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-semibold text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {formatRating(movie.vote_average)}
                </span>
              ) : null}
              {movie.release_date && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-white/50">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(movie.release_date)}
                </span>
              )}
              {movie.runtime ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-white/50">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRuntime(movie.runtime)}
                </span>
              ) : null}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      genreColors[g.name] ||
                        "bg-white/[0.04] text-white/60 border-white/[0.08]"
                    )}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
                {movie.overview}
              </p>
            )}
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Server
              </h3>
              <button
                onClick={() => setCurrentServer(currentServer)}
                className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reload
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {servers.map((server) => (
                <button
                  key={server.name}
                  onClick={() => handleServerChange(server)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border",
                    currentServer?.name === server.name
                      ? "bg-accent/15 border-accent/40 text-accent shadow-sm shadow-accent/10"
                      : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70 hover:border-white/20"
                  )}
                >
                  <Play className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{server.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {movie.poster_path && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                <img
                  src={getImageUrl(movie.poster_path, "w342")}
                  alt={movie.title || movie.name || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
