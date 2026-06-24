"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, getImageUrl } from "@/lib/utils";
import { getServersForMovie } from "@/lib/servers";
import type { VideoSource } from "@/types";
import {
  Eye, EyeOff, MessageSquare, Pause, Play, Send, Shield, UserMinus, Users,
  Copy, Check, Hash, ArrowLeft, Tv, SkipForward, Wifi, RefreshCw, ExternalLink,
  SkipBack, FastForward, Rewind, Timer,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Room {
  id: string;
  code: string;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  host_name: string;
  is_public: boolean;
  movie_id: number;
}

interface Participant {
  id: string;
  display_name: string;
  role: "host" | "viewer";
  last_seen_at?: string;
}

interface Message {
  id: string;
  display_name: string;
  body: string;
  created_at: string;
}

interface PlaybackState {
  state: "play" | "pause";
  at: number;
  timestamp: number;
  sender: string;
}

interface WatchPartyRoomProps {
  roomId: string;
}

const SYNC_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 15000;
const OFFLINE_THRESHOLD_MS = 20000;

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

export default function WatchPartyRoom({ roomId }: WatchPartyRoomProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [hostKey, setHostKey] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState>({ state: "pause", at: 0, timestamp: Date.now(), sender: "system" });
  const [serverUrl, setServerUrl] = useState("");
  const [serverIndex, setServerIndex] = useState(0);
  const [servers, setServers] = useState<VideoSource[]>([]);
  const [seekInput, setSeekInput] = useState("");
  const [showSeekInput, setShowSeekInput] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [synced, setSynced] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const playbackRef = useRef(playback);
  const syncTimerRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  playbackRef.current = playback;

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load room data
  useEffect(() => {
    const storedName = sessionStorage.getItem(`watch-party-name:${roomId}`) || "";
    const storedHostKey = sessionStorage.getItem(`watch-party-host:${roomId}`) || "";
    setDisplayName(storedName);
    setHostKey(storedHostKey);

    fetch(`/api/watch-party/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data.error) { setError(data.error); return; }
        setRoom(data.room);
        setParticipants(data.participants || []);
        setMessages(data.messages || []);
        setIsHost(data.isHost || Boolean(storedHostKey) || (data.participants || []).some((p: any) => p.display_name === storedName && p.role === "host"));

        if (data.room?.movie_id) {
          const allServers = getServersForMovie(data.room.movie_id);
          setServers(allServers);
          if (allServers.length > 0) setServerUrl(allServers[0].url);
        }

        if (data.sync) {
          const now = Date.now();
          const elapsed = data.sync.state === "play"
            ? (now - new Date(data.sync.updated_at).getTime()) / 1000
            : 0;
          setPlayback({
            state: data.sync.state,
            at: (data.sync.position || 0) + elapsed,
            timestamp: now,
            sender: "system",
          });
          setSynced(true);
        }
      })
      .catch(() => setError("Could not load this room."));
  }, [roomId]);

  // Realtime channel
  useEffect(() => {
    if (!supabase || !room) return;
    const channel = supabase.channel(`watch-party:${room.id}`, {
      config: { presence: { key: displayName || "guest" } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((current) => [...current, payload as Message].slice(-100));
      })
      .on("broadcast", { event: "playback" }, ({ payload }) => {
        const p = payload as PlaybackState;
        const elapsed = (Date.now() - p.timestamp) / 1000;
        const syncedAt = p.state === "play" ? p.at + elapsed : p.at;
        setPlayback({ ...p, at: syncedAt });
        setSynced(true);
      })
      .on("broadcast", { event: "server" }, ({ payload }) => {
        const url = (payload as any).serverUrl as string;
        const idx = (payload as any).serverIndex as number;
        if (url) setServerUrl(url);
        if (typeof idx === "number") setServerIndex(idx);
      })
      .on("broadcast", { event: "participants" }, () => refreshParticipants())
      .on("broadcast", { event: "kicked" }, ({ payload }) => {
        if ((payload as any).displayName === displayName) router.push("/watch-party?kicked=1");
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, any>;
        const online = new Set<string>();
        for (const key in state) {
          const name = state[key]?.[0]?.displayName;
          if (name) online.add(name);
        }
        setOnlineUsers(online);
      })
      .on("presence", { event: "join" }, ({ key, currentPresences }: { key: string; currentPresences: any[] }) => {
        const name = currentPresences?.[0]?.displayName;
        if (name) setOnlineUsers((prev) => new Set(prev).add(name));
      })
      .on("presence", { event: "leave" }, ({ key }: { key: string }) => {
        setOnlineUsers((prev) => { const next = new Set(prev); next.delete(key); return next; });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ displayName, online_at: new Date().toISOString() });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [displayName, room, router, supabase]);

  // Host periodic sync broadcast
  useEffect(() => {
    if (!isHost || !room) return;
    syncTimerRef.current = setInterval(() => {
      const p = playbackRef.current;
      if (p.state === "play") {
        const elapsed = (Date.now() - p.timestamp) / 1000;
        const next: PlaybackState = { ...p, at: p.at + elapsed, timestamp: Date.now() };
        setPlayback(next);
        broadcast("playback", next);
        updateSyncState("play", next.at);
      }
    }, SYNC_INTERVAL);
    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current); };
  }, [isHost, room]);

  // Heartbeat: keep last_seen_at fresh
  useEffect(() => {
    if (!room || !displayName) return;
    heartbeatRef.current = setInterval(() => {
      fetch(`/api/watch-party/rooms/${room.id}/heartbeat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      }).catch(() => {});
    }, HEARTBEAT_INTERVAL);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [room, displayName]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const refreshParticipants = async () => {
    const res = await fetch(`/api/watch-party/rooms/${roomId}`);
    const data = await res.json();
    setParticipants(data.participants || []);
  };

  const broadcast = useCallback((event: string, payload: unknown) => {
    if (channelRef.current) {
      channelRef.current.send({ type: "broadcast", event, payload });
    }
  }, []);

  const updateSyncState = async (state: string, position: number) => {
    try {
      await fetch(`/api/watch-party/rooms/${roomId}/sync`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, position, hostKey }),
      });
    } catch {}
  };

  const sendPlayback = (state: "play" | "pause") => {
    const now = Date.now();
    const p = playbackRef.current;
    const at = p.state === "play" ? p.at + (now - p.timestamp) / 1000 : p.at;
    const next: PlaybackState = { state, at, timestamp: now, sender: displayName || "Guest" };
    setPlayback(next);
    broadcast("playback", next);
    updateSyncState(state, at);
  };

  const seekTo = (position: number) => {
    const now = Date.now();
    const clamped = Math.max(0, position);
    const next: PlaybackState = { state: playbackRef.current.state, at: clamped, timestamp: now, sender: displayName || "Guest" };
    setPlayback(next);
    broadcast("playback", next);
    updateSyncState(next.state, clamped);
    setShowSeekInput(false);
    setSeekInput("");
  };

  const skipTime = (offset: number) => {
    const p = playbackRef.current;
    const now = Date.now();
    const currentAt = p.state === "play" ? p.at + (now - p.timestamp) / 1000 : p.at;
    seekTo(currentAt + offset);
  };

  const handleSeekSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seconds = parseTimeInput(seekInput);
    if (seconds !== null) seekTo(seconds);
  };

  const switchServer = (dir: 1 | -1) => {
    if (servers.length === 0) return;
    const nextIdx = (serverIndex + dir + servers.length) % servers.length;
    const nextUrl = servers[nextIdx].url;
    setServerIndex(nextIdx);
    setServerUrl(nextUrl);
    setPlayerReady(false);
    broadcast("server", { serverUrl: nextUrl, serverIndex: nextIdx });
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    const res = await fetch(`/api/watch-party/rooms/${roomId}/message`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: message, displayName }),
    });
    const data = await res.json();
    if (!res.ok || !data.message) { setError(data.error || "Could not send message."); return; }
    setMessage("");
    broadcast("message", data.message);
  };

  const togglePublic = async () => {
    if (!room) return;
    const next = !room.is_public;
    const res = await fetch(`/api/watch-party/rooms/${room.id}/visibility`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: next, hostKey }),
    });
    if (res.ok) { setRoom({ ...room, is_public: next }); broadcast("participants", {}); }
  };

  const kickParticipant = async (name: string) => {
    if (!room) return;
    const res = await fetch(`/api/watch-party/rooms/${room.id}/kick`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name, hostKey }),
    });
    if (res.ok) { await refreshParticipants(); broadcast("kicked", { displayName: name }); }
  };

  const isOnline = (name: string) => onlineUsers.has(name);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-red-500/20">
            <Shield className="h-8 w-8 text-red-300" />
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

  if (!room) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-64 rounded-2xl bg-white/[0.03]" />
        <div className="h-32 rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  const playbackTime = playback.state === "play"
    ? playback.at + (Date.now() - playback.timestamp) / 1000
    : playback.at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 xl:grid-cols-[1fr_360px]"
    >
      <div className="min-w-0 space-y-4">
        {/* Video Player */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.06] shadow-2xl shadow-black/50">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-blue-500 to-accent/20 z-10" />
          <div className="relative aspect-video bg-black">
            {serverUrl ? (
              <iframe
                ref={iframeRef}
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
                <p className="text-sm text-white/40">No stream available</p>
              </div>
            )}

            {!playerReady && serverUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm">
                <div className="relative">
                  <div className="w-14 h-14 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-accent/30 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-white/60">Loading stream for the room...</p>
              </div>
            )}
          </div>

          {/* Playback Controls Bar */}
          <div className="space-y-1 px-4 py-2.5 bg-[#0a0a0f] border-t border-white/[0.04]">
            {/* Sync status and timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    synced ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"
                  )} />
                  <span className={synced ? "text-emerald-400/60" : "text-yellow-400/60"}>
                    {synced ? (playback.state === "play" ? "Playing" : "Paused") : "Syncing..."}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-white/60 font-mono tabular-nums tracking-wider">
                <Timer className="w-3 h-3 text-white/30" />
                <span>{formatTime(playbackTime)}</span>
              </div>
              <div className="flex-1" />

              {/* Seek input (fold-out) */}
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
              ) : isHost ? (
                <button onClick={() => setShowSeekInput(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-accent transition-all" title="Seek to time">
                  <Timer className="w-3.5 h-3.5" />
                </button>
              ) : null}

              {/* Skip buttons */}
              <div className="flex items-center gap-0.5">
                {isHost && (
                  <>
                    <button onClick={() => skipTime(-30)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="-30s">
                      <Rewind className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => skipTime(-10)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="-10s">
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => sendPlayback("play")} className={cn("p-1.5 rounded-lg transition-all", playback.state === "play" ? "bg-accent/20 text-accent" : "hover:bg-white/5 text-white/30 hover:text-white/60")} title="Play">
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => sendPlayback("pause")} className={cn("p-1.5 rounded-lg transition-all", playback.state === "pause" ? "bg-accent/20 text-accent" : "hover:bg-white/5 text-white/30 hover:text-white/60")} title="Pause">
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => skipTime(10)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="+10s">
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => skipTime(30)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="+30s">
                      <FastForward className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isHost && servers.length > 1 && (
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

            {/* Server info & sync indicator */}
            {servers.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-white/20">
                <Wifi className="w-2.5 h-2.5" />
                <span>{servers[serverIndex]?.name || "Unknown"} ({serverIndex + 1}/{servers.length})</span>
                {!isHost && synced && (
                  <span className="text-accent/40">
                    &middot; Synced to {formatTime(playbackTime)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Room Info Bar */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={copyCode} className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all">
                <Hash className="w-4 h-4 text-accent/60" />
                <span className="font-bold tracking-wider text-white">{room.code}</span>
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/30" />}
              </button>
              <div>
                <p className="text-sm font-semibold text-white truncate">{room.title}</p>
                <p className="text-[10px] text-white/30">by {room.host_name} &middot; {participants.length} watching</p>
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

        {/* Participants */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent/60" />
              <p className="text-xs font-semibold text-white/70">Participants ({participants.length})</p>
            </div>
            <button onClick={() => setChatOpen((o) => !o)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              {chatOpen ? "Hide Chat" : "Show Chat"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {participants.map((p) => (
              <div key={p.id} className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all",
                isOnline(p.display_name)
                  ? "bg-white/[0.03] border-white/[0.06]"
                  : "bg-white/[0.01] border-white/[0.03] opacity-50"
              )}>
                <div className="relative">
                  <span className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent">{p.display_name[0].toUpperCase()}</span>
                  {isOnline(p.display_name) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0c0c14]" />
                  )}
                </div>
                <span className="text-xs text-white/60 truncate max-w-[80px]">{p.display_name}</span>
                {p.role === "host" && <Shield className="w-3 h-3 text-accent/60" />}
                {!isOnline(p.display_name) && p.role !== "host" && (
                  <WifiOff className="w-2.5 h-2.5 text-white/20" />
                )}
                {isHost && p.role !== "host" && (
                  <button onClick={() => kickParticipant(p.display_name)} className="ml-0.5 text-white/20 hover:text-red-300 transition-colors">
                    <UserMinus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <aside className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#0c0c14]/80 backdrop-blur-sm overflow-hidden flex flex-col",
        "xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)]",
        !chatOpen && "hidden xl:flex"
      )}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-accent" />
            <p className="font-semibold text-white">Room Chat</p>
            <span className="text-xs text-white/30">{messages.length}</span>
          </div>
          {isHost ? (
            <button onClick={togglePublic} className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs text-white/50 hover:text-white transition-colors">
              {room.is_public ? "Public" : "Private"}
            </button>
          ) : null}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/[0.03] px-3.5 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-accent">{item.display_name}</span>
                    <span className="text-[10px] text-white/20">{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{item.body}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/[0.06] p-3">
            <input value={message} onChange={(e) => setMessage(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-accent/40 transition-colors" placeholder="Message..." />
            <button className="rounded-xl bg-accent px-3.5 text-white hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>
    </motion.div>
  );
}

function WifiOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 7.06a10.94 10.94 0 0 1 2.76 1.5" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}
