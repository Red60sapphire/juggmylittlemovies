"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getServersForMovie } from "@/lib/servers";
import { getImageUrl, formatRating, formatDate } from "@/lib/utils";
import { addToLocalHistory } from "@/lib/localHistory";
import type { VideoSource, MovieDetails, CastMember, Trailer } from "@/types";
import {
  Play, SkipForward, Plus, Share2, Download, Star, ChevronRight, Check,
  Wifi, RefreshCw, AlertTriangle, Server, Tv, Film, Monitor, Users,
} from "lucide-react";

const LOAD_TIMEOUT = 5000;
const SETTLE_DELAY = 3000;

function getServerIcon(name: string): any {
  const lower = name.toLowerCase();
  if (lower.includes("embed") || lower.includes("player") || lower.includes("api")) return Server;
  if (lower.includes("flix") || lower.includes("movie") || lower.includes("box") || lower.includes("film")) return Film;
  if (lower.includes("stream") || lower.includes("watch") || lower.includes("show") || lower.includes("hub")) return Tv;
  if (lower.includes("vid") || lower.includes("link") || lower.includes("king") || lower.includes("play")) return Tv;
  return Monitor;
}

export default function MovieWatchPage() {
  const params = useParams();
  const movieId = parseInt(params.id as string);
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
  const [toastMsg, setToastMsg] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const timeoutRef = useRef<any>(null);
  const settleRef = useRef<any>(null);
  const currentServerRef = useRef<VideoSource | null>(null);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const clearTimeout_ = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (settleRef.current) { clearTimeout(settleRef.current); settleRef.current = null; }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setAutoAdvancing(false);
    setSwitchingSource(false);
    timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
  }, [servers]);

  useEffect(() => {
    if (timedOut && !autoAdvancing) { setSwitchingSource(true); tryServer(serverIndex + 1); }
  }, [timedOut, autoAdvancing, serverIndex, tryServer]);

  useEffect(() => {
    if (iframeError && !autoAdvancing) { setSwitchingSource(true); tryServer(serverIndex + 1); }
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

  const cast: CastMember[] = (movie as any)?.credits?.cast?.slice(0, 8) || [];
  const trailers: Trailer[] = ((movie as any)?.videos?.results || []).filter(
    (v: Trailer) => v.site === "YouTube" && v.type === "Trailer"
  ).slice(0, 4);
  const studio = movie?.production_companies?.[0]?.name || "";
  const year = movie?.release_date?.split("-")[0] || "";

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-border group/player shadow-2xl shadow-black/50">
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
                      <div className="w-14 h-14 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
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

                  {timedOut && !iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-400/60" />
                      </div>
                      <p className="text-white font-semibold">Timed out</p>
                      <p className="text-sm text-white/40">{currentServer.name} took too long</p>
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
                      <p className="text-white font-semibold">Failed to load</p>
                      <p className="text-sm text-white/40">{currentServer.name} refused connection</p>
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
                  <Play className="w-6 h-6 text-white/30" />
                  <p className="text-sm text-white/40">No sources available.</p>
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
                {currentServer ? currentServer.name : "No server selected"}
              </div>
              <div className="flex-1" />
              {serverIndex > 0 && servers.length > 1 && (
                <div className="text-[10px] text-white/20">{serverIndex + 1} / {servers.length}</div>
              )}
              {iframeLoaded && currentServer && (
                <button onClick={autoAdvance} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Try next server">
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight mb-1.5">{movie.title || movie.name}</h1>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted flex-wrap">
                  {movie.vote_average ? (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-500 text-yellow-500" />
                      {formatRating(movie.vote_average)}
                    </span>
                  ) : null}
                  {year && <span>{year}</span>}
                  {movie.runtime ? <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    const wl = JSON.parse(localStorage.getItem("juggmylittlemovies_watchlist") || "[]");
                    if (!wl.includes(movieId)) { wl.push(movieId); localStorage.setItem("juggmylittlemovies_watchlist", JSON.stringify(wl)); showToast("Added"); }
                    else { showToast("Already in list"); }
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white text-black text-xs md:text-sm font-semibold rounded-xl hover:bg-white/90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Watchlist</span>
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }}
                  className="p-2 rounded-xl bg-white/[0.04] border border-border text-muted hover:text-white transition-all"
                >
                  {shareCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
                <button className="p-2 rounded-xl bg-white/[0.04] border border-border text-muted hover:text-white transition-all">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border relative ${
                        isActive
                          ? "bg-white/8 border-white/20 text-white shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                      <span className="truncate">{server.name}</span>
                      {isWorking && <span className="w-1 h-1 rounded-full bg-emerald-400/60 flex-shrink-0 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trailers with YouTube thumbnails */}
          {trailers.length > 0 && (
            <div className="mt-6 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Trailers & Clips</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {trailers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => window.open(`https://youtube.com/watch?v=${t.key}`, "_blank")}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-surface border border-border hover:border-accent/50 transition-all"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${t.key}/hqdefault.jpg`}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                    <p className="absolute bottom-1 left-1 right-1 text-[10px] text-white/80 truncate px-1">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mt-6 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Cast</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {cast.map((c) => (
                  <div key={c.id} className="flex-shrink-0 w-20 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-surface border border-border mb-1.5">
                      {c.profile_path ? (
                        <img src={getImageUrl(c.profile_path, "w92")} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">?</div>
                      )}
                    </div>
                    <p className="text-[10px] text-white/80 truncate">{c.name}</p>
                    <p className="text-[9px] text-muted truncate">{c.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-[340px] flex-shrink-0">
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                <img src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"} alt={movie.title || ""} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold text-yellow-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  {formatRating(movie.vote_average)}
                </div>
              </div>
              <h2 className="font-bold text-white text-sm mb-1">{movie.title || movie.name}</h2>
              <p className="text-xs text-muted">{year} &middot; {movie.runtime || "?"} min</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Movie Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Status</span>
                  <span className="text-white">{movie.status || "Released"}</span>
                </div>
                {studio && (
                  <div className="flex justify-between">
                    <span className="text-muted">Studio</span>
                    <span className="text-white text-right">{studio}</span>
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex justify-between">
                    <span className="text-muted">Release</span>
                    <span className="text-white">{formatDate(movie.release_date)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Synopsis</h3>
              <p className="text-sm text-muted leading-relaxed line-clamp-4">
                {movie.overview || "No synopsis available."}
              </p>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.04] text-muted border border-border">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
