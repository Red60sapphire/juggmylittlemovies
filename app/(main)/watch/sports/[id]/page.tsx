"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, SkipForward, RefreshCw, AlertTriangle, Play, Wifi, Tv, Trophy } from "lucide-react";
import { getChannelById, getChannelsByCategory, SPORTS_CHANNELS } from "@/lib/sports";

const LOAD_TIMEOUT = 7000;

export default function SportsWatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const channel = getChannelById(id);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [switchingSource, setSwitchingSource] = useState(false);

  const timeoutRef = useRef<any>(null);
  const autoRetryRef = useRef<any>(null);

  const clearTimeout_ = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (autoRetryRef.current) { clearTimeout(autoRetryRef.current); autoRetryRef.current = null; }
  };

  const tryUrl = useCallback((index: number) => {
    if (!channel || index >= channel.embedUrls.length) { setIframeError(true); setAutoAdvancing(false); setSwitchingSource(false); return; }
    clearTimeout_();
    setCurrentUrlIndex(index);
    setIframeLoaded(false);
    setIframeError(false);
    setTimedOut(false);
    setAutoAdvancing(false);
    timeoutRef.current = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT);
  }, [channel]);

  useEffect(() => {
    if (channel && channel.embedUrls.length > 0) tryUrl(0);
    return () => clearTimeout_();
  }, [id]);

  useEffect(() => {
    if (timedOut && !iframeLoaded && channel && currentUrlIndex < channel.embedUrls.length - 1) {
      autoRetryRef.current = setTimeout(() => { setSwitchingSource(true); tryUrl(currentUrlIndex + 1); }, 3000);
      return () => { if (autoRetryRef.current) clearTimeout(autoRetryRef.current); };
    }
  }, [timedOut, iframeLoaded, currentUrlIndex, channel]);

  useEffect(() => {
    if (iframeError && !iframeLoaded && channel && currentUrlIndex < channel.embedUrls.length - 1) {
      autoRetryRef.current = setTimeout(() => { setSwitchingSource(true); tryUrl(currentUrlIndex + 1); }, 1500);
      return () => { if (autoRetryRef.current) clearTimeout(autoRetryRef.current); };
    }
  }, [iframeError, iframeLoaded, currentUrlIndex, channel]);

  const handleIframeLoad = () => {
    clearTimeout_();
    setIframeLoaded(true);
    setIframeError(false);
    setAutoAdvancing(false);
    setSwitchingSource(false);
  };

  const autoAdvance = () => {
    if (autoAdvancing || !channel) return;
    setAutoAdvancing(true);
    tryUrl(currentUrlIndex + 1);
  };

  if (!channel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/50 mb-4">Channel not found.</p>
        <Link href="/live-sports" className="text-accent hover:text-accent-hover text-sm font-medium">Back to sports</Link>
      </div>
    );
  }

  const relatedChannels = getChannelsByCategory(channel.category).filter(c => c.id !== channel.id).slice(0, 6);
  const currentUrl = channel.embedUrls[currentUrlIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.push("/live-sports")} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">{channel.name}</h1>
          <p className="text-xs text-white/40">Live Stream</p>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.06] shadow-2xl shadow-black/50 mb-4">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500/20 z-10" />
        <div className="relative aspect-video bg-black">
          {currentUrl && (
            <>
              <iframe
                key={currentUrl}
                src={currentUrl}
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
                    <div className="w-14 h-14 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-amber-500/30 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/70">
                      {switchingSource ? "Switching source..." : "Connecting to stream..."}
                    </p>
                    <p className="text-xs text-white/30 mt-1">Source {currentUrlIndex + 1} of {channel.embedUrls.length}</p>
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
                    <p className="text-sm text-white/40 mt-1">This source took too long</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={autoAdvance} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                      <SkipForward className="w-4 h-4" />
                      Next
                    </button>
                    <button onClick={() => tryUrl(currentUrlIndex)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
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
                    <p className="text-sm text-white/40 mt-1">This source refused connection</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={autoAdvance} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                      <SkipForward className="w-4 h-4" />
                      Next
                    </button>
                    <button onClick={() => tryUrl(0)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
                      <RefreshCw className="w-4 h-4" />
                      Start Over
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!currentUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Play className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-sm text-white/40">No sources available for this channel.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a0f] border-t border-white/[0.04]">
          {currentUrl && iframeLoaded && (
            <div className="flex items-center gap-2 text-xs text-emerald-400/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          )}
          {!iframeLoaded && currentUrl && (
            <div className="flex items-center gap-2 text-xs text-amber-400/40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-pulse" />
              Connecting
            </div>
          )}
          <div className="text-xs text-white/30">
            Source {currentUrlIndex + 1} / {channel.embedUrls.length}
          </div>
          <div className="flex-1" />
          {iframeLoaded && (
            <button onClick={autoAdvance} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Try next source">
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {relatedChannels.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3">More in this category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {relatedChannels.map(rc => (
              <Link
                key={rc.id}
                href={`/watch/sports/${rc.id}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/20 transition-all"
              >
                <Tv className="w-4 h-4 text-amber-400/40 flex-shrink-0" />
                <span className="text-xs text-white/50 truncate">{rc.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2 text-[10px] text-white/30">
          <Wifi className="w-3 h-3" />
          Streams auto-advance if a source fails. Use an ad blocker for best experience.
        </div>
      </div>
    </motion.div>
  );
}
