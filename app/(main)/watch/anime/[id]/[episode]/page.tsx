"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getServersForAnime } from "@/lib/servers";
import { getImageUrl, formatRating } from "@/lib/utils";
import type { VideoSource } from "@/types";
import {
  Play, SkipForward, ChevronLeft, ChevronRight, Star, AlertTriangle,
  RefreshCw, Server, Tv,
} from "lucide-react";

const LOAD_TIMEOUT = 5000;
const SETTLE_DELAY = 3000;

export default function AnimeWatchPage() {
  const params = useParams();
  const router = useRouter();
  const anilistId = parseInt(params.id as string);
  const episode = parseInt(params.episode as string) || 1;

  const [anime, setAnime] = useState<any>(null);
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
  const [totalEpisodes, setTotalEpisodes] = useState(12);
  const timeoutRef = useRef<any>(null);
  const settleRef = useRef<any>(null);
  const currentServerRef = useRef<VideoSource | null>(null);

  const clearTimeout_ = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (settleRef.current) { clearTimeout(settleRef.current); settleRef.current = null; }
  };

  const tryServer = useCallback((index: number) => {
    if (servers.length === 0) { setIframeError(true); return; }
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
    const query = `query ($id: Int) { Media(id: $id, type: ANIME) { id title { romaji english } coverImage { large extraLarge } bannerImage description averageScore genres episodes status seasonYear } }`;
    fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id: anilistId } }),
    })
      .then((r) => r.json())
      .then((data) => {
        const media = data?.data?.Media;
        if (media) {
          setAnime(media);
          setTotalEpisodes(media.episodes || 12);
        }
      })
      .catch(() => {});

    const availableServers = getServersForAnime(anilistId, episode);
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

    return () => clearTimeout_();
  }, [params.id, params.episode]);

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

  const changeEpisode = (dir: number) => {
    const next = episode + dir;
    if (next < 1 || next > totalEpisodes) return;
    router.push(`/watch/anime/${anilistId}/${next}`);
  };

  const title = anime?.title?.english || anime?.title?.romaji || "Anime";
  const year = anime?.seasonYear || "";
  const genres: string[] = anime?.genres || [];

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
                      <button onClick={autoAdvance} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/60 text-xs font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/10">
                        <SkipForward className="w-3 h-3" /> Skip
                      </button>
                    </div>
                  )}

                  {timedOut && !iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm p-8 text-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-400/60" />
                      <p className="text-white font-semibold">Timed out</p>
                      <p className="text-sm text-white/40">{currentServer.name} took too long</p>
                      <div className="flex gap-2 mt-1">
                        <button onClick={autoAdvance} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 transition-all">
                          <SkipForward className="w-4 h-4" /> Next
                        </button>
                        <button onClick={() => tryServer(serverIndex)} className="px-5 py-2.5 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                          <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm p-8 text-center">
                      <AlertTriangle className="w-6 h-6 text-red-400/60" />
                      <p className="text-white font-semibold">Failed to load</p>
                      <p className="text-sm text-white/40">{currentServer.name} refused connection</p>
                      <div className="flex gap-2 mt-1">
                        <button onClick={autoAdvance} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 transition-all">
                          <SkipForward className="w-4 h-4" /> Next
                        </button>
                        <button onClick={() => tryServer(0)} className="px-5 py-2.5 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                          <RefreshCw className="w-4 h-4" /> Start Over
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
                      <button onClick={autoAdvance} className="px-3 py-1.5 bg-white/10 text-white/70 text-xs font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/10">
                        Skip
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a0f] border-t border-white/[0.04]">
              {currentServer && iframeLoaded && settled && (
                <div className="flex items-center gap-2 text-xs text-emerald-400/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </div>
              )}
              <div className="text-xs text-white/30">{currentServer?.name || "No server"}</div>
              <div className="flex-1" />
              <button onClick={() => changeEpisode(-1)} disabled={episode <= 1}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 disabled:opacity-20 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/50">Ep {episode}/{totalEpisodes}</span>
              <button onClick={() => changeEpisode(1)} disabled={episode >= totalEpisodes}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 disabled:opacity-20 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight mb-1.5">
              {title} - Episode {episode}
            </h1>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted flex-wrap">
              {anime?.averageScore && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                  {formatRating(anime.averageScore / 10)}
                </span>
              )}
              {year && <span>{year}</span>}
              {genres.slice(0, 3).map((g) => (
                <span key={g} className="px-2 py-0.5 bg-white/[0.04] border border-border rounded text-[10px] text-muted">{g}</span>
              ))}
            </div>
          </div>

          {/* Episode Navigation */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-white mb-2">Episodes</h3>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                <button
                  key={ep}
                  onClick={() => router.push(`/watch/anime/${anilistId}/${ep}`)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-all border ${
                    ep === episode
                      ? "bg-accent border-accent text-white"
                      : "bg-white/[0.02] border-border text-white/40 hover:bg-white/[0.06] hover:text-white/70"
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>

          {/* Servers */}
          <div className="mt-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">Servers ({servers.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {servers.map((server) => {
                const isActive = currentServer?.name === server.name;
                const isWorking = workingServers.has(server.name);
                return (
                  <button
                    key={server.name}
                    onClick={() => { const idx = servers.findIndex((s) => s.name === server.name); if (idx >= 0) tryServer(idx); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                      isActive ? "bg-white/8 border-white/20 text-white" : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5 opacity-60" />
                    <span className="truncate">{server.name}</span>
                    {isWorking && <span className="w-1 h-1 rounded-full bg-emerald-400/60 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {anime && (
          <div className="w-full xl:w-[340px] flex-shrink-0">
            <div className="rounded-xl border border-border bg-surface p-4">
              {anime.coverImage?.large && (
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                  <img src={anime.coverImage.extraLarge || anime.coverImage.large} alt={title} className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="font-bold text-white text-sm mb-1">{title}</h2>
              <p className="text-xs text-muted">{year} &middot; {totalEpisodes} eps</p>
            </div>
            {anime.description && (
              <div className="rounded-xl border border-border bg-surface p-4 mt-4">
                <h3 className="text-sm font-semibold text-white mb-2">Synopsis</h3>
                <p className="text-sm text-muted leading-relaxed line-clamp-4">
                  {anime.description.replace(/<[^>]*>/g, "").slice(0, 400)}
                </p>
              </div>
            )}
            {genres.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-4 mt-4">
                <h3 className="text-sm font-semibold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <span key={g} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.04] text-muted border border-border">{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
