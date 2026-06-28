"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWatchParty } from "@/hooks/useWatchParty";
import { getImageUrl } from "@/lib/utils";
import { getServersForMovie } from "@/lib/servers";
import type { VideoSource } from "@/types";
import {
  MessageSquare, Pause, Play, Send, Users,
  Copy, Check, Hash, ArrowLeft, Tv,
  SkipForward, Wifi, RefreshCw, ExternalLink,
  SkipBack, FastForward, Rewind, Timer, X,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseTimeInput(value: string): number | null {
  const parts = value.split(":").map(Number);
  if (parts.length === 2 && parts.every(n => Number.isFinite(n))) return parts[0] * 60 + parts[1];
  if (parts.length === 3 && parts.every(n => Number.isFinite(n))) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  const num = Number(value);
  if (Number.isFinite(num)) return num;
  return null;
}

interface WatchPartyRoomProps {
  roomId: string;
}

export default function WatchPartyRoom({ roomId }: WatchPartyRoomProps) {
  const router = useRouter();
  const {
    connected, roomState, messages, isHost,
    reconnectHost, joinRoom, sendPlayback, sendSeek,
    sendChat, setOnPlayback,
  } = useWatchParty();

  const [displayName, setDisplayName] = useState("");
  const [hostKey, setHostKey] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackPlaying, setPlaybackPlaying] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [serverIndex, setServerIndex] = useState(0);
  const [servers, setServers] = useState<VideoSource[]>([]);
  const [seekInput, setSeekInput] = useState("");
  const [showSeekInput, setShowSeekInput] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Load stored data and join room
  useEffect(() => {
    const storedName = sessionStorage.getItem(`watch-party-name:${roomId}`) || "";
    const storedHostKey = sessionStorage.getItem(`watch-party-host:${roomId}`) || null;
    setDisplayName(storedName);
    setHostKey(storedHostKey);

    if (!connected) return;

    if (storedHostKey) {
      reconnectHost(roomId, storedHostKey, storedName || "Host");
    } else {
      joinRoom(roomId, storedName || "Guest");
    }
    setJoined(true);
  }, [connected, roomId, reconnectHost, joinRoom]);

  // Update local playback state from room state
  useEffect(() => {
    if (!roomState) return;
    setPlaybackPlaying(roomState.playing);
    setPlaybackTime(roomState.currentTime || 0);

    if (roomState.mediaId) {
      const id = parseInt(roomState.mediaId);
      if (!isNaN(id)) {
        const allServers = getServersForMovie(id);
        setServers(allServers);
        if (allServers.length > 0) setServerUrl(allServers[0].url);
      }
    }
  }, [roomState]);

  // Timer to advance playback time when playing
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (playbackPlaying) {
      timerRef.current = setInterval(() => {
        setPlaybackTime(t => t + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playbackPlaying]);

  // Listen for host playback events
  useEffect(() => {
    setOnPlayback((msg) => {
      if (msg.action === 'play') {
        setPlaybackPlaying(true);
        setPlaybackTime(msg.time || 0);
      } else if (msg.action === 'pause') {
        setPlaybackPlaying(false);
        setPlaybackTime(msg.time || 0);
      } else if (msg.action === 'seek') {
        setPlaybackTime(msg.time || 0);
      }
    });
  }, [setOnPlayback]);

  // Scroll chat to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const copyCode = () => {
    if (!roomState?.code) return;
    navigator.clipboard.writeText(roomState.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlay = () => {
    sendPlayback('play', playbackTime);
    setPlaybackPlaying(true);
  };

  const handlePause = () => {
    sendPlayback('pause', playbackTime);
    setPlaybackPlaying(false);
  };

  const handleSeek = (position: number) => {
    const clamped = Math.max(0, position);
    setPlaybackTime(clamped);
    sendSeek(clamped);
    setShowSeekInput(false);
    setSeekInput("");
  };

  const skipTime = (offset: number) => {
    handleSeek(Math.max(0, playbackTime + offset));
  };

  const handleSeekSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seconds = parseTimeInput(seekInput);
    if (seconds !== null) handleSeek(seconds);
  };

  const switchServer = (dir: 1 | -1) => {
    if (servers.length === 0) return;
    const nextIdx = (serverIndex + dir + servers.length) % servers.length;
    setServerIndex(nextIdx);
    setServerUrl(servers[nextIdx].url);
    setPlayerReady(false);
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput("");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-red-500/20">
            <X className="h-8 w-8 text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-white">Room Error</h2>
          <p className="mt-2 text-sm text-white/50">{error}</p>
          <Link href="/watch-party" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-hover transition-all">
            <ArrowLeft className="h-4 w-4" /> Back to rooms
          </Link>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-white/40">
          {connected ? "Joining room..." : "Connecting to server..."}
        </p>
      </div>
    );
  }

  const title = roomState.mediaTitle || roomState.roomName || "Watch Party";
  const memberCount = roomState.members?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 xl:grid-cols-[1fr_360px]"
    >
      <div className="min-w-0 space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.06] shadow-2xl shadow-black/50">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-blue-500 to-accent/20 z-10" />
          <div className="relative aspect-video bg-black">
            {serverUrl ? (
              <iframe
                key={serverUrl}
                src={serverUrl}
                className="w-full h-full"
                allowFullScreen
                referrerPolicy="no-referrer"
                allow="autoplay; fullscreen"
                onLoad={() => setPlayerReady(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-8 text-center">
                <Tv className="w-10 h-10 text-white/20" />
                <p className="text-sm text-white/40">Waiting for media to be selected...</p>
              </div>
            )}

            {!playerReady && serverUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm">
                <div className="w-14 h-14 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-sm text-white/60">Loading stream...</p>
              </div>
            )}
          </div>

          <div className="space-y-1 px-4 py-2.5 bg-[#0a0a0f] border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${playbackPlaying ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"}`} />
                  <span className={playbackPlaying ? "text-emerald-400/60" : "text-yellow-400/60"}>
                    {playbackPlaying ? "Playing" : "Paused"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-white/60 font-mono tabular-nums tracking-wider">
                <Timer className="w-3 h-3 text-white/30" />
                <span>{formatTime(playbackTime)}</span>
              </div>
              <div className="flex-1" />

              {showSeekInput ? (
                <form onSubmit={handleSeekSubmit} className="flex items-center gap-1.5">
                  <input
                    value={seekInput}
                    onChange={(e) => setSeekInput(e.target.value)}
                    placeholder="1:23 or 83"
                    className="w-24 rounded-lg bg-white/[0.06] border border-white/[0.08] px-2 py-1 text-[11px] text-white outline-none placeholder:text-white/20 focus:border-accent/40"
                    autoFocus
                    onBlur={() => setTimeout(() => setShowSeekInput(false), 200)}
                  />
                  <button type="submit" className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-accent transition-all">
                    <Check className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setShowSeekInput(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-accent transition-all" title="Seek to time">
                  <Timer className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex items-center gap-0.5">
                <>
                  <button onClick={() => skipTime(-30)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="-30s">
                    <Rewind className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => skipTime(-10)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="-10s">
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handlePlay} className="p-1.5 rounded-lg transition-all text-white/30 hover:text-white/60" title="Play">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handlePause} className="p-1.5 rounded-lg transition-all text-white/30 hover:text-white/60" title="Pause">
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => skipTime(10)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="+10s">
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => skipTime(30)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="+30s">
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                </>
              </div>

              <div className="flex items-center gap-1">
                {servers.length > 1 && (
                  <>
                    <button onClick={() => switchServer(-1)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Previous server">
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button onClick={() => switchServer(1)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Next server">
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </>
                )}
                {serverUrl && (
                  <a href={serverUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Open in new tab">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {servers.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-white/20">
                <Wifi className="w-2.5 h-2.5" />
                <span>{servers[serverIndex]?.name || "Unknown"} ({serverIndex + 1}/{servers.length})</span>
                <span className="text-accent/40">
                  &middot; {formatTime(playbackTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={copyCode} className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all">
                <Hash className="w-4 h-4 text-accent/60" />
                <span className="font-bold tracking-wider text-white">{roomState.code}</span>
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/30" />}
              </button>
              <div>
                <p className="text-sm font-semibold text-white truncate">{title}</p>
                <p className="text-[10px] text-white/30">{memberCount} watching</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 text-[10px] font-bold text-accent uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Live
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent/60" />
              <p className="text-xs font-semibold text-white/70">Participants ({memberCount})</p>
            </div>
            <button onClick={() => setChatOpen(o => !o)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              {chatOpen ? "Hide Chat" : "Show Chat"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roomState.members?.map((name: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="relative">
                  <span className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent">
                    {name[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <span className="text-xs text-white/60 truncate max-w-[80px]">{name}</span>
                {i === 0 && <span className="text-[9px] text-accent/60 font-semibold ml-1">HOST</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className={`rounded-2xl border border-white/[0.08] bg-[#0c0c14]/80 backdrop-blur-sm overflow-hidden flex flex-col xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)] ${!chatOpen && "hidden xl:flex"}`}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-accent" />
            <p className="font-semibold text-white">Room Chat</p>
            <span className="text-xs text-white/30">{messages.length}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.map((item: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/[0.03] px-3.5 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-accent">{item.username}</span>
                    <span className="text-[10px] text-white/20">
                      {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{item.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          <form onSubmit={sendChatMessage} className="flex gap-2 border-t border-white/[0.06] p-3">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-accent/40 transition-colors"
              placeholder="Message..."
            />
            <button className="rounded-xl bg-accent px-3.5 text-white hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50" disabled={!chatInput.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>
    </motion.div>
  );
}
