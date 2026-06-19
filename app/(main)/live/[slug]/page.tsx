"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2, AlertCircle, Maximize, Minimize, Share2, BookmarkCheck, Bookmark, Play, Pause, Volume2, VolumeX } from "lucide-react";
import Hls from "hls.js";

interface Channel {
  id: string;
  name: string;
  number: number;
  slug: string;
  category: string;
  summary: string;
  logo: string;
}

export default function LiveWatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let hls: Hls | null = null;

    async function loadChannel() {
      try {
        const res = await fetch(`/api/live/channels/${slug}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setChannel(data.channel);

        if (data.hlsUrl && videoRef.current) {
          const video = videoRef.current;
          const proxyUrl = `/api/live/stream?url=${encodeURIComponent(data.hlsUrl)}`;

          if (Hls.isSupported()) {
            hls = new Hls({
              xhrSetup: (xhr) => { xhr.withCredentials = false },
              enableWorker: false,
              startLevel: 0,
            });
            hls.loadSource(proxyUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
              setPlaying(true);
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setTimeout(() => hls?.startLoad(), 3000);
              } else if (data.fatal) {
                setError("Stream playback failed");
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = proxyUrl;
            video.addEventListener("loadedmetadata", () => {
              video.play().catch(() => {});
              setPlaying(true);
            });
          } else {
            setError("HLS playback not supported in this browser");
          }
        }
      } catch {
        setError("Could not load channel");
      } finally {
        setLoading(false);
      }
    }

    loadChannel();

    let overlayTimer: ReturnType<typeof setTimeout>;
    const showOverlayFn = () => {
      setShowOverlay(true);
      clearTimeout(overlayTimer);
      overlayTimer = setTimeout(() => setShowOverlay(false), 3000);
    };
    showOverlayFn();

    const video = videoRef.current;
    if (video) {
      video.addEventListener("mousemove", showOverlayFn);
      video.addEventListener("click", showOverlayFn);
    }

    return () => {
      if (hls) hls.destroy();
      clearTimeout(overlayTimer);
      if (video) {
        video.removeEventListener("mousemove", showOverlayFn);
        video.removeEventListener("click", showOverlayFn);
      }
    };
  }, [slug]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!channel) return;
    try {
      const stored = JSON.parse(localStorage.getItem("live_watchlist") || "[]");
      setIsBookmarked(stored.includes(channel.slug));
    } catch {}
  }, [channel]);

  const toggleBookmark = useCallback(() => {
    if (!channel) return;
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("live_watchlist") || "[]");
      const idx = stored.indexOf(channel.slug);
      if (idx >= 0) {
        stored.splice(idx, 1);
        setIsBookmarked(false);
      } else {
        stored.push(channel.slug);
        setIsBookmarked(true);
      }
      localStorage.setItem("live_watchlist", JSON.stringify(stored));
    } catch {}
  }, [channel]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      if (val === 0) { video.muted = true; setMuted(true); }
      else { video.muted = false; setMuted(false); }
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied!");
      setTimeout(() => setShareMsg(null), 2000);
    } catch {}
  }, []);

  return (
    <main id="main-content" className="relative w-full h-screen bg-black overflow-hidden">
      {/* Loading */}
      <AnimatePresence>
        {loading && !error && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black"
          >
            <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
            <p className="text-sm text-muted">Loading stream...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-muted gap-4"
          >
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p>{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/live")}
                className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-all active:scale-90"
              >
                Back to Live
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent rounded-lg text-sm text-black font-medium hover:bg-accent-hover transition-all active:scale-90"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        muted={false}
        onClick={togglePlay}
      />

      {/* Overlay */}
      {channel && !loading && !error && (
        <>
          {/* Backdrop gradient */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
              showOverlay ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          </div>

          {/* Top bar */}
          <div
            className={`absolute top-0 left-0 right-0 p-4 z-10 transition-all duration-500 ${
              showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <button
                onClick={() => router.push("/live")}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all active:scale-75"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {channel.logo && (
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="h-7 object-contain"
                  />
                )}
                {!channel.logo && (
                  <h1 className="text-sm font-bold truncate text-white">
                    {channel.name}
                  </h1>
                )}
                <span className="text-[11px] text-muted hidden sm:inline">
                  {channel.category}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-accent mr-2">
                <span className={`w-1.5 h-1.5 rounded-full ${playing ? "bg-accent animate-pulse" : "bg-muted"}`} />
                {playing ? "LIVE" : "Buffering"}
              </span>
              <button
                onClick={toggleBookmark}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all active:scale-75"
                title={isBookmarked ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-accent" />
                ) : (
                  <Bookmark className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all active:scale-75 relative"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-white" />
                {shareMsg && (
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-accent whitespace-nowrap bg-black/80 px-2 py-0.5 rounded">
                    {shareMsg}
                  </span>
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all active:scale-75"
                title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-500 ${
              showOverlay ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="px-4 pb-4 max-w-7xl mx-auto">
              {/* Play/pause + volume row */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all active:scale-75"
                >
                  {playing ? <Pause className="w-5 h-5 text-white fill-white" /> : <Play className="w-5 h-5 text-white fill-white ml-0.5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all active:scale-75"
                >
                  {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>

                <div className="relative w-24 md:w-32 group">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-accent
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
                  />
                </div>

                <div className="flex-1" />

                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                  <span className={`w-1.5 h-1.5 rounded-full ${playing ? "bg-accent animate-pulse" : "bg-muted"}`} />
                  {playing ? "LIVE" : "Paused"}
                </span>
              </div>

              {/* Channel info row */}
              <div className="flex items-center gap-3">
                {channel.logo && (
                  <img src={channel.logo} alt={channel.name} className="h-6 object-contain" />
                )}
                <div className="min-w-0">
                  {!channel.logo && (
                    <h1 className="text-sm font-bold text-white truncate">{channel.name}</h1>
                  )}
                  {channel.summary && (
                    <p className="text-xs text-white/50 line-clamp-1 max-w-lg">{channel.summary}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
