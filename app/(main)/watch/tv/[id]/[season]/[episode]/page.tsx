"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getServersForTV } from "@/lib/servers";
import { getImageUrl, formatRating, formatDate, cn } from "@/lib/utils";
import { addToLocalHistory } from "@/lib/localHistory";
import { isInLocalWatchlist } from "@/lib/local-storage";
import type { VideoSource, MovieDetails, CastMember, Trailer } from "@/types";
import {
  Play, SkipForward, Plus, Share2, Download, Star, ChevronRight,
  Wifi, RefreshCw, AlertTriangle, Server, Tv, Film, Monitor, Globe,
  List, Grid3X3, ChevronDown,
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

interface SeasonInfo {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
}

interface EpisodeInfo {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  air_date: string;
  still_path: string | null;
  runtime: number | null;
}

export default function TvWatchPage() {
  const params = useParams();
  const tvId = parseInt(params.id as string);
  const seasonNum = parseInt(params.season as string);
  const episodeNum = parseInt(params.episode as string);

  const [tvShow, setTvShow] = useState<MovieDetails | null>(null);
  const [episode, setEpisode] = useState<any>(null);
  const [servers, setServers] = useState<VideoSource[]>([]);
  const [currentServer, setCurrentServer] = useState<VideoSource | null>(null);
  const [serverIndex, setServerIndex] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [switchingSource, setSwitchingSource] = useState(false);
  const [workingServers, setWorkingServers] = useState<Set<string>>(new Set());
  const [isBlocked, setIsBlocked] = useState(false);
  const [episodes, setEpisodes] = useState<EpisodeInfo[]>([]);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(seasonNum);
  const [activeEpisode, setActiveEpisode] = useState(episodeNum);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const timeoutRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const loadEpisode = useCallback((season: number, episode: number) => {
    setSelectedSeason(season);
    setActiveEpisode(episode);
    setIframeLoaded(false);
    setIframeError(false);
    setTimedOut(false);
    setAutoAdvancing(false);
    setIsLoading(true);

    window.history.replaceState({}, '', `/watch/tv/${tvId}/${season}/${episode}`);

    const availableServers = getServersForTV(tvId, season, episode);
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

    clearTimeout_();

    if (sorted.length > 0) {
      setCurrentServer(sorted[initialIndex]);
      setServerIndex(initialIndex);
      timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
    } else {
      setIframeError(true);
    }
    setIsLoading(false);

    fetch(`/api/tmdb/tv/${tvId}/season/${season}/episode/${episode}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setEpisode(data);
      })
      .catch(() => {});

    fetch(`/api/tmdb/tv/${tvId}/season/${season}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error && data.episodes) {
          setEpisodes(data.episodes);
        }
      })
      .catch(() => {});
  }, [tvId]);

  useEffect(() => {
    const handleSiteGuardChange = (event: Event) => {
      setIsBlocked((event as CustomEvent).detail.blocked);
    };

    window.addEventListener("siteguard-change", handleSiteGuardChange);

    fetch(`/api/tmdb/tv/${tvId}`)
      .then((r) => r.json())
      .then((data) => {
        setTvShow(data);
        if (data.seasons) {
          setSeasons(data.seasons.filter((s: SeasonInfo) => s.season_number > 0));
        }
        addToLocalHistory(tvId, data.name || "Unknown", data.poster_path, data.backdrop_path);
        setInWatchlist(isInLocalWatchlist(tvId));
      })
      .catch(() => {});

    loadEpisode(seasonNum, episodeNum);

    return () => {
      clearTimeout_();
      window.removeEventListener("siteguard-change", handleSiteGuardChange);
    };
  }, [tvId, seasonNum, episodeNum, loadEpisode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSeasonDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSeasonChange = (newSeason: number) => {
    setSelectedSeason(newSeason);
    setShowSeasonDropdown(false);
    if (episodes.length > 0) {
      const firstEp = episodes.find((e) => e.episode_number === 1) || episodes[0];
      loadEpisode(newSeason, firstEp.episode_number);
    }
  };

  const handleEpisodeClick = (epNum: number) => {
    loadEpisode(selectedSeason, epNum);
  };

  useEffect(() => {
    if ((timedOut || iframeError) && !autoAdvancing && currentServer) {
      autoAdvance();
    }
  }, [timedOut, iframeError, autoAdvancing, currentServer]);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [watchlistToast, setWatchlistToast] = useState(false);

  const handleWatchlist = useCallback(async () => {
    if (!tvShow) return;
    const { addToLocalWatchlist } = await import("@/lib/local-storage");
    const added = addToLocalWatchlist({ movie_id: tvShow.id, title: tvShow.name || "", poster_path: tvShow.poster_path, vote_average: tvShow.vote_average });
    setInWatchlist(added);
    fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie_id: tvShow.id,
        title: tvShow.name,
        poster_path: tvShow.poster_path,
        vote_average: tvShow.vote_average,
      }),
    }).catch(() => {});
    setWatchlistToast(true);
    setTimeout(() => setWatchlistToast(false), 1800);
  }, [tvShow]);

  const handleShareTv = useCallback(() => {
    const url = `${window.location.origin}/watch/tv/${tvId}/${selectedSeason}/${activeEpisode}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 1800);
  }, [tvId, selectedSeason, activeEpisode]);

  if (!tvShow || isLoading) {
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

  const title = `${(tvShow as any).name || tvShow.title} - S${selectedSeason}E${activeEpisode}`;
  const year = ((tvShow as any).first_air_date || tvShow.release_date || "").split("-")[0];
  const cast: CastMember[] = (tvShow as any)?.credits?.cast?.slice(0, 8) || [];
  const trailers: Trailer[] = ((tvShow as any)?.videos?.results || []).filter(
    (v: Trailer) => v.site === "YouTube" && v.type === "Trailer"
  ).slice(0, 4);
  const studio = (tvShow as any)?.production_companies?.[0]?.name || "";
  const showName = (tvShow as any).name || tvShow.title;
  const currentSeasonInfo = seasons.find((s) => s.season_number === selectedSeason);

  return (
    <main id="main-content" className="max-w-[1600px] mx-auto">
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
              {currentServer && iframeLoaded && (
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
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight mb-1.5 break-words">{title}</h1>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#9CA3AF] flex-wrap">
                  {tvShow.vote_average && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-500 text-yellow-500" />
                      {formatRating(tvShow.vote_average)}
                    </span>
                  )}
                  {year && <span>{year}</span>}
                  {episode?.runtime && <span>{episode.runtime}m</span>}
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
                <button onClick={handleShareTv} className="p-2 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-all active:scale-90 relative">
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
            <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3.5 border-b border-[#2A2A2A] bg-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1" ref={dropdownRef}>
                    <button
                      onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[#1B1B1B] border border-[#2A2A2A] rounded-xl text-sm text-white hover:border-white/20 hover:bg-[#222] transition-all group"
                    >
                      {currentSeasonInfo?.poster_path && (
                        <img
                          src={getImageUrl(currentSeasonInfo.poster_path, "w92")}
                          alt=""
                          className="w-7 h-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{currentSeasonInfo?.name || `Season ${selectedSeason}`}</div>
                        <div className="text-[11px] text-[#9CA3AF]">{episodes.length} episodes</div>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-[#9CA3AF] transition-all group-hover:text-white", showSeasonDropdown && "rotate-180")} />
                    </button>
                    {showSeasonDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/40">
                        {seasons.map((s) => (
                          <button
                            key={s.season_number}
                            onClick={() => handleSeasonChange(s.season_number)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-all border-l-2",
                              s.season_number === selectedSeason
                                ? "bg-white/10 text-white border-l-white"
                                : "hover:bg-[#222] text-[#9CA3AF] border-l-transparent hover:text-white hover:border-l-[#555]"
                            )}
                          >
                            {s.poster_path ? (
                              <img src={getImageUrl(s.poster_path, "w92")} alt="" className="w-7 h-10 rounded object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-10 rounded bg-[#2A2A2A] flex items-center justify-center text-xs text-[#555] flex-shrink-0">{s.season_number}</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">{s.name}</div>
                              <div className="text-[11px] text-[#555]">{s.episode_count} episodes</div>
                            </div>
                            {s.season_number === selectedSeason && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-[#1B1B1B] rounded-lg p-0.5 border border-[#2A2A2A]">
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === "list" ? "bg-white/15 text-white shadow-sm" : "text-[#555] hover:text-white"
                      )}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === "grid" ? "bg-white/15 text-white shadow-sm" : "text-[#555] hover:text-white"
                      )}
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={cn(
                "overflow-y-auto scrollbar-hide",
                viewMode === "grid" ? "p-3" : ""
              )} style={{ maxHeight: "440px" }}>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-4 gap-2">
                    {episodes.map((ep) => {
                      const isCurrentEpisode = ep.episode_number === activeEpisode;
                      return (
                        <button
                          key={ep.id}
                          onClick={() => handleEpisodeClick(ep.episode_number)}
                          className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-[#1B1B1B] border transition-all"
                          style={{ borderColor: isCurrentEpisode ? "rgb(255 255 255 / 0.4)" : "rgb(42 42 42 / 1)" }}
                        >
                          {ep.still_path ? (
                            <img
                              src={getImageUrl(ep.still_path, "w342")}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#333] text-lg font-bold">
                              {ep.episode_number}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                              <Play className="w-3.5 h-3.5 text-black ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-black/70 backdrop-blur-sm"
                            style={{ color: isCurrentEpisode ? "#fff" : "#9CA3AF" }}>
                            {ep.episode_number}
                          </div>
                          {isCurrentEpisode && (
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-black text-center">
                              Now Playing
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="divide-y divide-[#222]">
                    {episodes.map((ep) => {
                      const isCurrentEpisode = ep.episode_number === activeEpisode;
                      return (
                        <button
                          key={ep.id}
                          onClick={() => handleEpisodeClick(ep.episode_number)}
                          className={cn(
                            "w-full flex items-start gap-3.5 px-3.5 py-3 text-left transition-all border-l-2",
                            isCurrentEpisode
                              ? "bg-white/[0.06] border-l-emerald-500"
                              : "hover:bg-[#1A1A1A] border-l-transparent hover:border-l-[#333]"
                          )}
                        >
                          <div className="w-[100px] aspect-video rounded-lg overflow-hidden bg-[#1B1B1B] flex-shrink-0 border border-[#2A2A2A] relative group/thumb">
                            {ep.still_path ? (
                              <img
                                src={getImageUrl(ep.still_path, "w342")}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#333] text-lg font-bold">
                                {ep.episode_number}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all duration-200 transform scale-75 group-hover/thumb:scale-100">
                                <Play className="w-3 h-3 text-black ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/80 backdrop-blur-sm text-white/80">
                              {ep.runtime ? `${ep.runtime}m` : ''}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className={cn(
                                  "text-sm font-medium leading-tight mb-0.5",
                                  isCurrentEpisode ? "text-white" : "text-white/90"
                                )}>
                                  {ep.episode_number}. {ep.name}
                                </div>
                                {ep.air_date && (
                                  <div className="text-[11px] text-[#555] font-medium">
                                    {formatDate(ep.air_date)}
                                  </div>
                                )}
                              </div>
                              {isCurrentEpisode && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0 mt-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-[10px] font-semibold text-emerald-400">Now</span>
                                </div>
                              )}
                            </div>
                            {ep.overview && (
                              <p className="text-[12px] text-[#666] leading-relaxed mt-1.5 line-clamp-2">
                                {ep.overview}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {episodes.length === 0 && (
                  <div className="p-10 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] flex items-center justify-center">
                      <Tv className="w-5 h-5 text-[#555]" />
                    </div>
                    <p className="text-sm text-[#9CA3AF]">No episodes available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-[#171717] border border-[#2A2A2A]">
              <div className="relative aspect-[2/3]">
                <img
                  src={getImageUrl(tvShow.poster_path, "w342") || "/placeholder.svg"}
                  alt={showName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold text-yellow-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  {formatRating(tvShow.vote_average)}
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-bold text-white text-lg mb-1">{showName}</h2>
                <p className="text-xs text-[#9CA3AF]">{year} &middot; S{selectedSeason}E{activeEpisode}</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Status</span>
                  <span className="text-white">{(tvShow as any).status || "Released"}</span>
                </div>
                {studio && (
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Network</span>
                    <span className="text-white text-right">{studio}</span>
                  </div>
                )}
                {(tvShow as any).first_air_date && (
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Aired</span>
                    <span className="text-white">{formatDate((tvShow as any).first_air_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {episode && (
              <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Episode</h3>
                <p className="text-sm text-[#9CA3AF] mb-2">{episode.name || `Episode ${activeEpisode}`}</p>
                <p className="text-sm text-[#9CA3AF] leading-relaxed line-clamp-3">
                  {episode.overview || "No synopsis available."}
                </p>
              </div>
            )}

            {tvShow.genres && tvShow.genres.length > 0 && (
              <div className="rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres.map((g: any) => (
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
