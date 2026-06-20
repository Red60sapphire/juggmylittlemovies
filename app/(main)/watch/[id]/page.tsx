"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getServersForMovie } from "@/lib/servers";
import { getImageUrl, formatRating, formatDate, cn } from "@/lib/utils";
import { addToLocalHistory } from "@/lib/localHistory";
import { isInLocalWatchlist } from "@/lib/local-storage";
import WatchPartyUI from "@/components/WatchPartyUI";
import type { VideoSource, MovieDetails, CastMember, Trailer } from "@/types";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Settings,
  Plus, Share2, Download, Star, Calendar, Clock, ChevronRight,
  Wifi, RefreshCw, AlertTriangle, Server, Tv, Film, Monitor, Users,
} from "lucide-react";

const LOAD_TIMEOUT = 10000;

const serverIcons: Record<string, any> = {
  VidLink: Film, "API Player": Server, "VidSrc 2": Monitor,
  "Embed.su": Tv, MultiEmbed: Server, AutoEmbed: Monitor,
  VidBinge: Tv, VidSrc: Monitor, "2Embed": Monitor, "VidSrc 3": Monitor,
};

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
  const [workingServers, setWorkingServers] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [partyError, setPartyError] = useState("");
  const timeoutRef = useRef<any>(null);

  const movieId = parseInt(params.id as string);

  const clearTimeout_ = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  const tryServer = useCallback((index: number) => {
    if (index >= servers.length) { setIframeError(true); setAutoAdvancing(false); return; }
    clearTimeout_();
    setServerIndex(index);
    setCurrentServer(servers[index]);
    setIframeLoaded(false);
    setIframeError(false);
    setTimedOut(false);
    setIsPlaying(false);
    timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
  }, [servers]);

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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-[#9CA3AF]">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
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

            <div className="flex items-center gap-3 px-4 py-3 bg-[#111111] border-t border-[#2A2A2A]">
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                <Play className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="flex-1 h-1 mx-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-white rounded-full" />
              </div>
              <span className="text-xs text-[#9CA3AF] tabular-nums whitespace-nowrap">12:34 / 2:05:00</span>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                <Maximize className="w-5 h-5" />
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
                <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white text-black text-xs md:text-sm font-semibold rounded-xl hover:bg-white/90 transition-all">
                  <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Watchlist</span>
                </button>
                <button className="p-2 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-all">
                  <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
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

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Servers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                {servers.map((server) => {
                  const Icon = serverIcons[server.name] || Monitor;
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

          <WatchPartyUI
            movieId={movieId}
            movieTitle={movie?.title || "Movie"}
            posterPath={movie?.poster_path || null}
            backdropPath={movie?.backdrop_path || null}
          />
        </div>

        <div className="w-full xl:w-[340px] flex-shrink-0">
          <div className="space-y-5">
            <div className="relative rounded-xl overflow-hidden bg-[#171717] border border-[#2A2A2A]">
              <div className="relative aspect-[2/3]">
                <img
                  src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
                  alt={movie.title || movie.name || ""}
                  className="w-full h-full object-cover"
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
                  {movie.genres.map((g) => (
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
              </div>
            )}

            {cast.length > 0 && (
              <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
