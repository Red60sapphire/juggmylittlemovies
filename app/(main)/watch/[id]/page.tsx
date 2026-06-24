"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getServersForMovie } from "@/lib/servers";
import { getImageUrl, formatRating, formatDate, cn } from "@/lib/utils";
import { addToLocalHistory } from "@/lib/localHistory";
import { isInLocalWatchlist } from "@/lib/local-storage";
import type { VideoSource, MovieDetails, CastMember, Trailer } from "@/types";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Settings,
  Plus, Share2, Download, Star, Calendar, Clock, ChevronRight, Check,
  Wifi, RefreshCw, AlertTriangle, Server, Tv, Film, Monitor, Users,
} from "lucide-react";

const LOAD_TIMEOUT = 7000;

function getServerIcon(name: string): any {
  const lower = name.toLowerCase();
  if (lower.includes("embed")) return Server;
  if (lower.includes("player") || lower.includes("api")) return Server;
  if (lower.includes("flix") || lower.includes("movie") || lower.includes("box") || lower.includes("film")) return Film;
  if (lower.includes("stream") || lower.includes("watch") || lower.includes("show") || lower.includes("hub")) return Tv;
  if (lower.includes("vid") || lower.includes("link") || lower.includes("king") || lower.includes("play")) return Tv;
  if (lower.includes("dbgo") || lower.includes("rive")) return Monitor;
  return Monitor;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [servers, setServers] = useState<VideoSource[]>([]);
  const [currentServer, setCurrentServer] = useState<VideoSource | null>(null);
  const [serverIndex, setServerIndex] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [switchingSource, setSwitchingSource] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [workingServers, setWorkingServers] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [partyError, setPartyError] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const timeoutRef = useRef<any>(null);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };
  const autoRetryRef = useRef<any>(null);

  const movieId = parseInt(params.id as string);

  const clearTimeout_ = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (autoRetryRef.current) { clearTimeout(autoRetryRef.current); autoRetryRef.current = null; }
  };

  const tryServer = useCallback((index: number) => {
    if (index >= servers.length) { setIframeError(true); setAutoAdvancing(false); setSwitchingSource(false); return; }
    clearTimeout_();
    setServerIndex(index);
    setCurrentServer(servers[index]);
    setIframeLoaded(false);
    setIframeError(false);
    setTimedOut(false);
    setIsPlaying(false);
    setAutoAdvancing(false);
    timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
  }, [servers]);

  // Auto-retry: when timed out, try next server after 3s
  useEffect(() => {
    if (timedOut && !iframeLoaded && serverIndex < servers.length - 1) {
      setAutoRetryCount((c) => c + 1);
      autoRetryRef.current = setTimeout(() => {
        setSwitchingSource(true);
        tryServer(serverIndex + 1);
      }, 3000);
      return () => { if (autoRetryRef.current) clearTimeout(autoRetryRef.current); };
    }
  }, [timedOut, iframeLoaded, serverIndex, servers.length]);

  // Auto-retry: when iframe errors, try next server after 1.5s
  useEffect(() => {
    if (iframeError && !iframeLoaded && serverIndex < servers.length - 1) {
      autoRetryRef.current = setTimeout(() => {
        setSwitchingSource(true);
        tryServer(serverIndex + 1);
      }, 1500);
      return () => { if (autoRetryRef.current) clearTimeout(autoRetryRef.current); };
    }
  }, [iframeError, iframeLoaded, serverIndex, servers.length]);

  useEffect(() => {
    const availableServers = getServersForMovie(movieId);
    const saved = sessionStorage.getItem("working_servers");
    const working = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    const sorted = [...availableServers].sort((a, b) => {
      const aW = working.has(a.name) ? 0 : 1;
      const bW = working.has(b.name) ? 0 : 1;
      return aW - bW;
    });
    setServers(sorted);
    setWorkingServers(working);
    const idx = sorted.findIndex((s) => working.has(s.name));
    tryServer(idx >= 0 ? idx : 0);

    fetch(`/api/tmdb/movie/${movieId}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data);
        addToLocalHistory(movieId, data.title || data.name || "Unknown", data.poster_path, data.backdrop_path);
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
      sessionStorage.setItem("working_servers", JSON.stringify([...updated]));
    }
  };

  const autoAdvance = () => {
    if (autoAdvancing) return;
    setAutoAdvancing(true);
    tryServer(serverIndex + 1);
  };

  const startWatchParty = async () => {
    if (!movie) return;
    setPartyError("");
    const displayName = window.prompt("Display name for this watch party") || "";
    const res = await fetch("/api/watch-party/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movieId,
        title: movie.title || movie.name || "Untitled",
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        displayName,
      }),
    });
    const data = (await res.json()) as { roomId?: string; displayName?: string; hostKey?: string; error?: string };
    if (!res.ok || !data.roomId) {
      setPartyError(data.error || "Could not create watch party.");
      return;
    }
    sessionStorage.setItem(`watch-party-name:${data.roomId}`, data.displayName || displayName || "Host");
    if (data.hostKey) sessionStorage.setItem(`watch-party-host:${data.roomId}`, data.hostKey);
    router.push(`/watch-party/${data.roomId}`);
  };

  const cast: CastMember[] = (movie as any)?.credits?.cast?.slice(0, 8) || [];
  const trailers: Trailer[] = ((movie as any)?.videos?.results || []).filter(
    (v: Trailer) => v.site === "YouTube" && v.type === "Trailer"
  ).slice(0, 4);
  const studio = movie?.production_companies?.[0]?.name || "";
  const year = movie?.release_date?.split("-")[0] || "";

  if (!movie) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[80vh]"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-[#9CA3AF]">Loading player...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-[#2A2A2A] group/player shadow-2xl shadow-black/40">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-purple-600 via-blue-500 to-transparent z-10" />
            <div className="relative aspect-video bg-black">
              {currentServer && (
                <>
                  <iframe
                    key={currentServer.url}
                    src={currentServer.url}
                    className="w-full h-full"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    allow="autoplay; fullscreen"
                    onLoad={handleIframeLoad}
                    onError={() => { setIframeError(true); clearTimeout_(); }}
                  />

                  {!iframeLoaded && !iframeError && !timedOut && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B0B0B]">
                      <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <p className="text-sm text-[#9CA3AF]">
                        {switchingSource ? "Switching source..." : "Loading stream..."}
                      </p>
                      <p className="text-xs text-[#555]">{currentServer.name}</p>
                    </div>
                  )}

                  {switchingSource && (
                    <div className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-accent/80 backdrop-blur-sm rounded-lg text-xs font-medium text-white flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Switching source...
                    </div>
                  )}

                  {timedOut && !iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B0B0B] p-8 text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                      <p className="text-white font-medium">Server not responding</p>
                      <p className="text-sm text-[#9CA3AF] max-w-xs">{currentServer.name} is taking too long.</p>
                      <div className="flex gap-2">
                        <button onClick={autoAdvance} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 transition-all">
                          <SkipForward className="w-4 h-4" />
                          Try Next
                        </button>
                        <button onClick={() => tryServer(serverIndex)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B1B1B] text-white text-sm font-semibold rounded-xl border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-all">
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B0B0B] p-8 text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                      <p className="text-white font-medium">Failed to load</p>
                      <p className="text-sm text-[#9CA3AF] max-w-xs">{currentServer.name} couldn&apos;t be reached.</p>
                      <div className="flex gap-2">
                        <button onClick={autoAdvance} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 transition-all">
                          <SkipForward className="w-4 h-4" />
                          Try Next
                        </button>
                        <button onClick={() => tryServer(0)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B1B1B] text-white text-sm font-semibold rounded-xl border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-all">
                          <RefreshCw className="w-4 h-4" />
                          Start Over
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!currentServer && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B0B0B] p-8 text-center">
                  <Play className="w-10 h-10 text-[#555]" />
                  <p className="text-sm text-[#9CA3AF]">No sources available.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#111111] border-t border-[#2A2A2A] opacity-60 hover:opacity-100 transition-opacity">
              <button title="Controls handled by embedded player" className="p-1 rounded-lg text-white/40 cursor-default">
                <Play className="w-4 h-4" />
              </button>
              <button title="Controls handled by embedded player" className="p-1 rounded-lg text-white/40 cursor-default">
                <SkipBack className="w-4 h-4" />
              </button>
              <button title="Controls handled by embedded player" className="p-1 rounded-lg text-white/40 cursor-default">
                <SkipForward className="w-4 h-4" />
              </button>
              <button title="Controls handled by embedded player" className="p-1 rounded-lg text-white/40 cursor-default">
                <Volume2 className="w-4 h-4" />
              </button>
              <div className="flex-1 h-1 mx-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-white/30 rounded-full" />
              </div>
              <span className="text-xs text-[#555] tabular-nums whitespace-nowrap">Embed</span>
              <button title="Controls handled by embedded player" className="p-1 rounded-lg text-white/40 cursor-default">
                <Settings className="w-4 h-4" />
              </button>
              <button title="Controls handled by embedded player" className="p-1 rounded-lg text-white/40 cursor-default">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight mb-1.5 break-words">
                  {movie.title || movie.name}
                </h1>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#9CA3AF] flex-wrap">
                  {movie.vote_average ? (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-500 text-yellow-500" />
                      {formatRating(movie.vote_average)}
                    </span>
                  ) : null}
                  {year && <span>{year}</span>}
                  {movie.runtime ? (
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const wl = JSON.parse(localStorage.getItem("stremer_watchlist") || "[]");
                      if (!wl.includes(movieId)) {
                        wl.push(movieId);
                        localStorage.setItem("stremer_watchlist", JSON.stringify(wl));
                        showToast("Added to watchlist");
                      } else {
                        showToast("Already in watchlist");
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white text-black text-xs md:text-sm font-semibold rounded-xl hover:bg-white/90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Watchlist</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  }}
                  className="p-2 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-all"
                  title="Copy share link"
                >
                  {shareCopied ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" /> : <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                </button>
                <button onClick={startWatchParty} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-accent text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-accent-hover transition-all">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Party</span>
                </button>
                <button className="p-2 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-all">
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
            {partyError ? (
              <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {partyError}
              </p>
            ) : null}
            {toastMsg && (
              <div className="mb-4 rounded-xl bg-accent/20 border border-accent/30 px-3 py-2 text-sm text-accent flex items-center gap-2">
                <Check className="w-4 h-4" />
                {toastMsg}
              </div>
            )}

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Servers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                {servers.map((server) => {
                  const Icon = getServerIcon(server.name);
                  const isActive = currentServer?.name === server.name;
                  const isWorking = workingServers.has(server.name);
                  return (
                    <button
                      key={server.name}
                      onClick={() => handleServerChange(server)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border",
                        isActive
                          ? "bg-white/10 border-white/30 text-white"
                          : "bg-[#1B1B1B] border-[#2A2A2A] text-[#9CA3AF] hover:bg-[#2A2A2A] hover:text-white hover:border-white/20"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{server.name}</span>
                      {isWorking && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {iframeLoaded && (
                <p className="text-xs text-green-500/60 mt-2 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected via {currentServer?.name}
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="w-full xl:w-[340px] flex-shrink-0">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-xl overflow-hidden bg-[#171717] border border-[#2A2A2A] group"
            >
              <div className="relative aspect-[2/3]">
                <img
                  src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
                  alt={movie.title || movie.name || ""}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold text-yellow-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  {formatRating(movie.vote_average)}
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-bold text-white text-lg mb-1">{movie.title || movie.name}</h2>
                <p className="text-xs text-[#9CA3AF]">{year} &middot; {movie.runtime || "?"} min</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4"
            >
              <h3 className="text-sm font-semibold text-white mb-3">Movie Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Status</span>
                  <span className="text-white">{movie.status || "Released"}</span>
                </div>
                {studio && (
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Studio</span>
                    <span className="text-white text-right">{studio}</span>
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Release</span>
                    <span className="text-white">{formatDate(movie.release_date)}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4"
            >
              <h3 className="text-sm font-semibold text-white mb-2">Synopsis</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed line-clamp-4">
                {movie.overview || "No synopsis available."}
              </p>
            </motion.div>

            {movie.genres && movie.genres.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4"
              >
                <h3 className="text-sm font-semibold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="px-3 py-1 rounded-lg text-xs font-medium bg-[#1B1B1B] text-[#9CA3AF] border border-[#2A2A2A]">
                      {g.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {trailers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Trailers</h3>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </div>
                <div className="space-y-2">
                  {trailers.map((t) => (
                    <a
                      key={t.id}
                      href={`https://youtube.com/watch?v=${t.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-all group"
                    >
                      <div className="w-10 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Play className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-[#9CA3AF] group-hover:text-white transition-colors truncate">{t.name}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {cast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4"
              >
                <h3 className="text-sm font-semibold text-white mb-3">Cast</h3>
                <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-hide">
                  {cast.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#1B1B1B] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#1B1B1B] border border-[#2A2A2A] overflow-hidden flex-shrink-0">
                        {c.profile_path ? (
                          <img src={getImageUrl(c.profile_path, "w92")} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#555] text-xs">?</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{c.character}</p>
                        <p className="text-xs text-[#9CA3AF] truncate">{c.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
