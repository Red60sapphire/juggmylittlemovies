"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Film,
  Shield,
  Zap,
  Server,
  Wifi,
  WifiOff,
  ChevronRight,
  SkipForward,
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

const LOAD_TIMEOUT = 10000;

const serverStatusIcons: Record<string, any> = {
  VidLink: Zap,
  MultiEmbed: Shield,
  AutoEmbed: Server,
  "2Embed": Shield,
  VidBinge: Zap,
  DBMovie: Film,
  GoStream: Server,
  M4UFree: Shield,
  EmbedMaster: Server,
  "API Player": Server,
};

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [servers, setServers] = useState<VideoSource[]>([]);
  const [currentServer, setCurrentServer] = useState<VideoSource | null>(null);
  const [serverIndex, setServerIndex] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [workingServers, setWorkingServers] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const movieId = parseInt(params.id as string);

  const clearTimeout_ = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const tryServer = useCallback(
    (index: number) => {
      if (index >= servers.length) {
        setIframeError(true);
        setAutoAdvancing(false);
        return;
      }
      clearTimeout_();
      setServerIndex(index);
      setCurrentServer(servers[index]);
      setIframeLoaded(false);
      setIframeError(false);
      setTimedOut(false);

      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
      }, LOAD_TIMEOUT);
    },
    [servers]
  );

  useEffect(() => {
    const availableServers = getServersForMovie(movieId);
    const saved = sessionStorage.getItem(`working_servers`);
    const working = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();

    const sorted = [...availableServers].sort((a, b) => {
      const aWorks = working.has(a.name) ? 0 : 1;
      const bWorks = working.has(b.name) ? 0 : 1;
      return aWorks - bWorks;
    });

    setServers(sorted);
    setWorkingServers(working);

    const initialIndex = sorted.findIndex((s) => working.has(s.name));
    tryServer(initialIndex >= 0 ? initialIndex : 0);

    fetch(`/api/tmdb/movie/${movieId}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data);
        addToLocalHistory(
          movieId,
          data.title || data.name || "Unknown",
          data.poster_path,
          data.backdrop_path
        );
      })
      .catch(() => {});

    return () => clearTimeout_();
  }, [params.id]);

  const handleServerChange = (server: VideoSource) => {
    const idx = servers.findIndex((s) => s.name === server.name);
    if (idx >= 0) tryServer(idx);
  };

  const handleIframeLoad = () => {
    clearTimeout_();
    setIframeLoaded(true);
    setIframeError(false);
    setAutoAdvancing(false);
    if (currentServer) {
      const updated = new Set(workingServers);
      updated.add(currentServer.name);
      setWorkingServers(updated);
      sessionStorage.setItem(
        "working_servers",
        JSON.stringify([...updated])
      );
    }
  };

  const autoAdvance = () => {
    if (autoAdvancing) return;
    setAutoAdvancing(true);
    tryServer(serverIndex + 1);
  };

  const handleIframeError_ = () => {
    setIframeError(true);
    clearTimeout_();
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
    <div className="pb-16">
      <div className="relative mb-8">
        {movie.backdrop_path && (
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
            <img
              src={getImageUrl(movie.backdrop_path, "original")}
              alt=""
              className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
          </div>
        )}

        <div className="flex items-center justify-between mb-4 px-1 pt-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-white/30 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Link
            href={`/movie/${movieId}`}
            className="text-xs text-accent/70 hover:text-accent transition-colors flex items-center gap-1"
          >
            More Info
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50 border border-white/[0.06] group/player"
        >
          <div className="relative aspect-video bg-black/90">
            {currentServer && (
              <>
                <AnimatePresence mode="wait">
                  <motion.iframe
                    key={currentServer.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: iframeLoaded ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    src={currentServer.url}
                    className="w-full h-full"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    allow="autoplay; fullscreen"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError_}
                  />
                </AnimatePresence>

                {!iframeLoaded && !iframeError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-accent/50 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-white/50 font-medium">
                        Loading stream...
                      </p>
                      <p className="text-xs text-white/20 mt-1">
                        {currentServer.name}
                      </p>
                    </div>
                  </div>
                )}

                {timedOut && !iframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <WifiOff className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/70 font-medium mb-1">
                        Server not responding
                      </p>
                      <p className="text-white/30 text-xs max-w-xs mx-auto">
                        {currentServer.name} is taking too long. Try another
                        server below or let us find one.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={autoAdvance}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        <SkipForward className="w-4 h-4" />
                        Try Next Server
                      </button>
                      <button
                        onClick={() => tryServer(serverIndex)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {iframeError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white/70 font-medium mb-1">
                        Failed to load
                      </p>
                      <p className="text-white/30 text-xs max-w-xs mx-auto">
                        {currentServer.name} couldn&apos;t be reached.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={autoAdvance}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        <SkipForward className="w-4 h-4" />
                        Try Next Server
                      </button>
                      <button
                        onClick={() => tryServer(0)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Start Over
                      </button>
                    </div>
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

            {iframeLoaded && (
              <div className="absolute top-3 left-3 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] text-white/50 flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-green-400" />
                  {currentServer?.name}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {movie.title || movie.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mb-4">
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
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            ) : null}
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] text-white/60 border border-white/[0.08]"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {movie.overview && (
            <p className="text-sm text-white/40 leading-relaxed max-w-2xl mb-6">
              {movie.overview}
            </p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-white/70">Servers</h3>
          <span className="text-xs text-white/20 ml-auto">
            {serverIndex + 1} / {servers.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {servers.map((server, i) => {
            const Icon = serverStatusIcons[server.name] || Monitor;
            const isActive = currentServer?.name === server.name;
            const isWorking = workingServers.has(server.name);
            return (
              <button
                key={server.name}
                onClick={() => handleServerChange(server)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                  isActive
                    ? "bg-accent/15 border-accent/40 text-accent shadow-sm shadow-accent/5"
                    : isWorking
                    ? "bg-green-500/5 border-green-500/20 text-white/60 hover:bg-green-500/10 hover:text-white/80"
                    : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                )}
                title={isWorking ? "Previously working" : undefined}
              >
                <Icon
                  className={cn(
                    "w-3 h-3 flex-shrink-0",
                    isWorking && !isActive && "text-green-400/60"
                  )}
                />
                <span className="truncate">{server.name}</span>
                {isWorking && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
                )}
              </button>
            );
          })}
        </div>
        {iframeLoaded && (
          <p className="text-[11px] text-green-400/50 mt-2 flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            Connected via {currentServer?.name}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        {movie.poster_path && (
          <div className="hidden md:block flex-shrink-0">
            <div className="relative w-24 aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
              <img
                src={getImageUrl(movie.poster_path, "w185")}
                alt={movie.title || movie.name || ""}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">
            About {movie.title || movie.name}
          </h4>
          <p className="text-sm text-white/40 leading-relaxed line-clamp-4">
            {movie.overview || "No overview available."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
