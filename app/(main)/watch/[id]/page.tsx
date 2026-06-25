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

const LOAD_TIMEOUT = 5000;
const SETTLE_DELAY = 3000;

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
  const [settled, setSettled] = useState(false);
  const [workingServers, setWorkingServers] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [partyError, setPartyError] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const timeoutRef = useRef<any>(null);
  const settleRef = useRef<any>(null);
  const currentServerRef = useRef<VideoSource | null>(null);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const movieId = parseInt(params.id as string);

  const clearTimeout_ = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (settleRef.current) { clearTimeout(settleRef.current); settleRef.current = null; }
  };

  const tryServer = useCallback((index: number) => {
    if (servers.length === 0) { setIframeError(true); setAutoAdvancing(false); setSwitchingSource(false); return; }
    const safeIndex = index % servers.length;
    clearTimeout_();
    setSettled(false);
    setServerIndex(safeIndex);
    setCurrentServer(servers[safeIndex]);
    currentServerRef.current = servers[safeIndex];
    setIframeLoaded(false);
    setIframeError(false);
    setTimedOut(false);
    setIsPlaying(false);
    setAutoAdvancing(false);
    setSwitchingSource(false);
    timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
  }, [servers]);

  // Auto-advance on timeout: try next server with wrap-around
  useEffect(() => {
    if (timedOut && !autoAdvancing) {
      setSwitchingSource(true);
      tryServer(serverIndex + 1);
    }
  }, [timedOut, autoAdvancing, serverIndex, tryServer]);

  // Auto-advance on iframe error: try next server with wrap-around
  useEffect(() => {
    if (iframeError && !autoAdvancing) {
      setSwitchingSource(true);
      tryServer(serverIndex + 1);
    }
  }, [iframeError, autoAdvancing, serverIndex, tryServer]);

  useEffect(() => {
    fetch(`/api/tmdb/movie/${movieId}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data);
        addToLocalHistory(movieId, data.title || data.name || "Unknown", data.poster_path, data.backdrop_path);
        const availableServers = getServersForMovie(movieId, data.imdb_id);
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
    // Don't mark as working yet — wait for settle period
    settleRef.current = setTimeout(() => {
      setSettled(true);
      const server = currentServerRef.current;
      if (server) {
        setWorkingServers((prev) => {
          const updated = new Set(prev);
          updated.add(server.name);
          sessionStorage.setItem("working_servers", JSON.stringify([...updated]));
          return updated;
        });
      }
    }, SETTLE_DELAY);
  };

  const autoAdvance = () => {
    if (autoAdvancing) return;
    setAutoAdvancing(true);
    clearTimeout_();
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
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.06] group/player shadow-2xl shadow-black/50">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-blue-500 to-accent/20 z-10" />
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm">
                      <div className="relative">
                        <div className="w-14 h-14 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-accent/30 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white/70">
                          {switchingSource ? "Switching source..." : "Loading stream..."}
                        </p>
                        <p className="text-xs text-white/30 mt-1">{currentServer.name}</p>
                      </div>
                      <button onClick={autoAdvance} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/60 text-xs font-semibold rounded-xl hover:bg-white/20 active:scale-95 transition-all border border-white/10">
                        <SkipForward className="w-3 h-3" />
                        Skip
                      </button>
                    </div>
                  )}

                  {switchingSource && (
                    <div className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-xs font-medium text-white/70 flex items-center gap-2 border border-white/10">
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Auto-switching...
                    </div>
                  )}

                  {timedOut && !iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-400/60" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">Timed out</p>
                        <p className="text-sm text-white/40 mt-1">{currentServer.name} took too long</p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button onClick={autoAdvance} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                          <SkipForward className="w-4 h-4" />
                          Next
                        </button>
                        <button onClick={() => tryServer(serverIndex)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400/60" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">Failed to load</p>
                        <p className="text-sm text-white/40 mt-1">{currentServer.name} refused connection</p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button onClick={autoAdvance} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                          <SkipForward className="w-4 h-4" />
                          Next
                        </button>
                        <button onClick={() => tryServer(0)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
                          <RefreshCw className="w-4 h-4" />
                          Start Over
                        </button>
                      </div>
                    </div>
                  )}

                  {iframeLoaded && !settled && !timedOut && !iframeError && (
                    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg text-xs font-medium text-white/50 flex items-center gap-2 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-yellow-400/60 animate-pulse" />
                        Verifying...
                      </div>
                      <button onClick={autoAdvance} className="px-3 py-1.5 bg-white/10 text-white/70 text-xs font-semibold rounded-lg hover:bg-white/20 active:scale-95 transition-all border border-white/10">
                        Skip
                      </button>
                    </div>
                  )}
                </>
              )}

              {!currentServer && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white/30" />
                  </div>
                  <p className="text-sm text-white/40">No sources available. Try another title.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a0f] border-t border-white/[0.04]">
              {currentServer && iframeLoaded && settled && (
                <div className="flex items-center gap-2 text-xs text-emerald-400/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                {currentServer ? (
                  <><span className="w-1 h-1 rounded-full bg-white/20" />{currentServer.name}</>
                ) : (
                  "No server selected"
                )}
              </div>
              <div className="flex-1" />
              {serverIndex > 0 && servers.length > 1 && (
                <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                  {serverIndex + 1} / {servers.length}
                </div>
              )}
              {iframeLoaded && currentServer && (
                <button
                  onClick={autoAdvance}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
                  title="Try next server"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}
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
                      const wl = JSON.parse(localStorage.getItem("juggmylittlemovies_watchlist") || "[]");
                      if (!wl.includes(movieId)) {
                        wl.push(movieId);
                        localStorage.setItem("juggmylittlemovies_watchlist", JSON.stringify(wl));
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/70">
                  Servers <span className="text-white/20 font-normal">({servers.length})</span>
                </h3>
                {iframeLoaded && currentServer && (
                  <span className="text-[10px] text-emerald-400/50 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {currentServer.name}
                  </span>
                )}
              </div>
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
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border relative",
                        isActive
                          ? "bg-white/8 border-white/20 text-white shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/70"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                      <span className="truncate">{server.name}</span>
                      {isWorking && <span className="w-1 h-1 rounded-full bg-emerald-400/60 flex-shrink-0 ml-auto" />}
                      {isActive && <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-accent/40 to-transparent" />}
                    </button>
                  );
                })}
              </div>
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
