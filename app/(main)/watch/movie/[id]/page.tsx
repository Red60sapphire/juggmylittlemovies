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
  Play, SkipForward, Plus, Share2, Download, Star, ChevronRight,
  Wifi, RefreshCw, AlertTriangle, Server, Tv, Film, Monitor, Globe,
} from "lucide-react";

const LOAD_TIMEOUT = 10000;

const serverIcons: Record<string, any> = {
  Juggmylittlemovies: Film, Core: Monitor,
  VidSrc: Tv, ZxcStream: Monitor,
  CinemaOS: Tv, Vid2: Monitor, Peach: Film, Mapi: Server,
  VidPlays: Tv, VidEasy: Film, ScreenScape: Monitor,
  French: Globe, Spanish: Globe, Italian: Globe,
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [workingServers, setWorkingServers] = useState<Set<string>>(new Set());
  const [isBlocked, setIsBlocked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [watchlistToast, setWatchlistToast] = useState(false);
  const timeoutRef = useRef<any>(null);

  const clearTimeout_ = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  const tryServer = useCallback((index: number) => {
    if (servers.length === 0) { setIframeError(true); setAutoAdvancing(false); return; }
    const safeIndex = index % servers.length;
    clearTimeout_();
    setServerIndex(safeIndex);
    setCurrentServer(servers[safeIndex]);
    setIframeLoaded(false);
    setIframeError(false);
    setTimedOut(false);
    timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
  }, [servers]);

  useEffect(() => {
    const handleSiteGuardChange = (event: Event) => {
      setIsBlocked((event as CustomEvent).detail.blocked);
    };

    window.addEventListener("siteguard-change", handleSiteGuardChange);

    const availableServers = getServersForMovie(movieId);
    const saved = sessionStorage.getItem("working_servers");
    const working = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    const sorted = [...availableServers].sort((a, b) => {
      const aZynema = a.name === "Juggmylittlemovies" ? 0 : 1;
      const bZynema = b.name === "Juggmylittlemovies" ? 0 : 1;
      if (aZynema !== bZynema) return aZynema - bZynema;
      const aW = working.has(a.name) ? 0 : 1;
      const bW = working.has(b.name) ? 0 : 1;
      return aW - bW;
    });
    setServers(sorted);
    setWorkingServers(working);
    const idx = sorted.findIndex((s) => s.name === "Juggmylittlemovies" || working.has(s.name));
    const initialIndex = idx >= 0 ? idx : 0;

    if (sorted.length > 0) {
      setCurrentServer(sorted[initialIndex]);
      setServerIndex(initialIndex);
      timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
    } else {
      setIframeError(true);
    }
    setIsLoading(false);

    fetch(`/api/tmdb/movie/${movieId}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data);
        addToLocalHistory(movieId, data.title || "Unknown", data.poster_path, data.backdrop_path);
        setInWatchlist(isInLocalWatchlist(movieId));
      })
      .catch(() => {});

    return () => {
      clearTimeout_();
      window.removeEventListener("siteguard-change", handleSiteGuardChange);
    };
  }, [movieId]);

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

  useEffect(() => {
    if ((timedOut || iframeError) && !autoAdvancing && currentServer) {
      autoAdvance();
    }
  }, [timedOut, iframeError, autoAdvancing, currentServer]);

  const handleWatchlist = useCallback(async () => {
    if (!movie) return;
    const { addToLocalWatchlist } = await import("@/lib/local-storage");
    const added = addToLocalWatchlist({ movie_id: movie.id, title: movie.title || "", poster_path: movie.poster_path, vote_average: movie.vote_average });
    setInWatchlist(added);
    setWatchlistToast(true);
    setTimeout(() => setWatchlistToast(false), 1800);
  }, [movie]);

  const handleShareMovie = useCallback(() => {
    const url = `${window.location.origin}/watch/movie/${movieId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 1800);
  }, [movieId]);

  const cast: CastMember[] = (movie as any)?.credits?.cast?.slice(0, 8) || [];
  const trailers: Trailer[] = ((movie as any)?.videos?.results || []).filter(
    (v: Trailer) => v.site === "YouTube" && v.type === "Trailer"
  ).slice(0, 4);
  const studio = movie?.production_companies?.[0]?.name || "";
  const year = movie?.release_date?.split("-")[0] || "";

  if (!movie || isLoading) {
    return (
      <main id="main-content" className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-[#9CA3AF]">Loading player...</p>
        </div>
      </main>
    );
  }

  if (isBlocked) {
    return (
      <main id="main-content" className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-10 h-10 text-[#9CA3AF]" />
          <p className="text-sm text-[#9CA3AF] text-center max-w-xs">
            Streaming is blocked due to DevTools detection. Please close DevTools to continue.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-[#2A2A2A] group/player shadow-2xl">
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
                    sandbox={currentServer.sandbox ? "allow-scripts allow-same-origin allow-forms allow-popups" : undefined}
                    onLoad={handleIframeLoad}
                    onError={() => { setIframeError(true); clearTimeout_(); }}
                  />
                  {!iframeLoaded && !iframeError && !timedOut && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B0B0B]">
                      <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <p className="text-sm text-[#9CA3AF]">Loading stream...</p>
                      <p className="text-xs text-[#555]">{currentServer.name}</p>
                    </div>
                  )}
                  {timedOut && !iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B0B0B] p-8 text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                      <p className="text-white font-medium">Server not responding</p>
                      <p className="text-sm text-[#9CA3AF] max-w-xs">{currentServer.name} is taking too long. Trying next...</p>
                    </div>
                  )}
                  {iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B0B0B] p-8 text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                      <p className="text-white font-medium">Failed to load</p>
                      <p className="text-sm text-[#9CA3AF] max-w-xs">{currentServer.name} couldn&apos;t be reached. Trying next...</p>
                    </div>
                  )}
                </>
              )}
              {/* Removed !currentServer block as it is now always initialized or error state handles it */}
            </div>
          </div>
          <div className="mt-4 md:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight mb-1.5 break-words">{movie.title}</h1>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#9CA3AF] flex-wrap">
                  {movie.vote_average && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-500 text-yellow-500" />
                      {formatRating(movie.vote_average)}
                    </span>
                  )}
                  {movie.release_date && <span>{movie.release_date.split("-")[0]}</span>}
                  {movie.runtime && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={handleWatchlist} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white text-black text-xs md:text-sm font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-95 relative">
                  <Plus className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-200 ${inWatchlist ? "rotate-45" : ""}`} />
                  <span className="hidden sm:inline">{inWatchlist ? "Remove" : "Watchlist"}</span>
                  {watchlistToast && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-white whitespace-nowrap bg-black/90 px-2 py-0.5 rounded-full">{inWatchlist ? "Removed!" : "Added!"}</span>
                  )}
                </button>
                <button onClick={handleShareMovie} className="p-2 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-all active:scale-90 relative">
                  <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {shareToast && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-white whitespace-nowrap bg-black/90 px-2 py-0.5 rounded-full">Link copied!</span>
                  )}
                </button>
                <button className="p-2 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-all">
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Servers</h3>
              <p className="text-xs text-[#9CA3AF] mb-3">🚀 Please try different servers if one isn't working, and consider using ad blockers or the Brave browser 😊.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                {servers.map((server) => {
                  const Icon = serverIcons[server.name] || Monitor;
                  const isActive = currentServer?.name === server.name;
                  return (
                    <button
                      key={server.name}
                      onClick={() => handleServerChange(server)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border",
                        isActive ? "bg-white/10 border-white/30 text-white" : "bg-[#1B1B1B] border-[#2A2A2A] text-[#9CA3AF] hover:bg-[#2A2A2A] hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{server.name}</span>
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
            <div className="relative rounded-xl overflow-hidden bg-[#171717] border border-[#2A2A2A]">
              <div className="relative aspect-[2/3]">
                <img
                  src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold text-yellow-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  {formatRating(movie.vote_average)}
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-bold text-white text-lg mb-1">{movie.title}</h2>
                <p className="text-xs text-[#9CA3AF]">{year} &middot; {movie.runtime || "?"} min</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Movie Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Status</span>
                  <span className="text-white">{movie.status || "Released"}</span>
                </div>
                {studio && (
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Production</span>
                    <span className="text-white text-right">{studio}</span>
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Aired</span>
                    <span className="text-white">{formatDate(movie.release_date)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Synopsis</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed line-clamp-4">
                {movie.overview || "No synopsis available."}
              </p>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g: any) => (
                    <span key={g.id} className="px-3 py-1 rounded-lg text-xs font-medium bg-[#1B1B1B] text-[#9CA3AF] border border-[#2A2A2A]">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {trailers.length > 0 && (
              <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Trailers</h3>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </div>
                <div className="space-y-2">
                  {trailers.map((t: Trailer) => (
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
              </div>
            )}

            {cast.length > 0 && (
              <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Characters</h3>
                  <span className="text-xs text-[#9CA3AF]">view all</span>
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-hide">
                  {cast.map((c: CastMember) => (
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
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
