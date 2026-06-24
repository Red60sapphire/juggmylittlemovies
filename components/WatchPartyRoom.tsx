"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, getImageUrl } from "@/lib/utils";
import { getServersForMovie } from "@/lib/servers";
import {
  Eye, EyeOff, MessageSquare, Pause, Play, Send, Shield, UserMinus, Users,
  Copy, Check, Hash, ArrowLeft, Tv, SkipForward, Wifi, RefreshCw, ExternalLink,
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
  const endRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const playbackRef = useRef(playback);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const syncTimerRef = useRef<any>(null);

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  playbackRef.current = playback;

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
        if (data.user?.username) setDisplayName(data.user.username);
        if (data.room?.movie_id) {
          const servers = getServersForMovie(data.room.movie_id);
          if (servers.length > 0) setServerUrl(servers[0].url);
        }
      })
      .catch(() => setError("Could not load this room."));
  }, [roomId]);

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
      })
      .on("broadcast", { event: "participants" }, () => refreshParticipants())
      .on("broadcast", { event: "kicked" }, ({ payload }) => {
        if ((payload as any).displayName === displayName) router.push("/watch-party?kicked=1");
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ displayName, online_at: new Date().toISOString() });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [displayName, room, router, supabase]);

  // Periodic sync: host broadcasts current playback time every 3s
  useEffect(() => {
    if (!isHost || !room) return;
    syncTimerRef.current = setInterval(() => {
      const p = playbackRef.current;
      if (p.state === "play") {
        const elapsed = (Date.now() - p.timestamp) / 1000;
        broadcast("playback", { ...p, at: p.at + elapsed, timestamp: Date.now() });
      }
    }, SYNC_INTERVAL);
    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current); };
  }, [isHost, room]);

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

  const sendPlayback = (state: "play" | "pause") => {
    const now = Date.now();
    const p = playbackRef.current;
    const at = state === "pause" ? p.at : p.at;
    const next: PlaybackState = { state, at, timestamp: now, sender: displayName || "Guest" };
    setPlayback(next);
    broadcast("playback", next);
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

  const kick = async (name: string) => {
    if (!room) return;
    const res = await fetch(`/api/watch-party/rooms/${room.id}/kick`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name, hostKey }),
    });
    if (res.ok) { await refreshParticipants(); broadcast("kicked", { displayName: name }); }
  };

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
  const mins = Math.floor(playbackTime / 60);
  const secs = Math.floor(playbackTime % 60);

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

          {/* Playback bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a0f] border-t border-white/[0.04]">
            {playerReady && (
              <div className="flex items-center gap-2 text-xs text-emerald-400/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {playback.state === "play" ? "Playing" : "Paused"}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-white/30">
              <span className="tabular-nums">{mins}:{secs.toString().padStart(2, "0")}</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => sendPlayback("play")}
                className={`p-1.5 rounded-lg transition-all ${playback.state === "play" ? "bg-accent/20 text-accent" : "hover:bg-white/5 text-white/30 hover:text-white/60"}`}
                title="Sync play"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => sendPlayback("pause")}
                className={`p-1.5 rounded-lg transition-all ${playback.state === "pause" ? "bg-accent/20 text-accent" : "hover:bg-white/5 text-white/30 hover:text-white/60"}`}
                title="Sync pause"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            </div>
            {serverUrl && (
              <a href={serverUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Open in new tab">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
              <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent">{p.display_name[0].toUpperCase()}</span>
                <span className="text-xs text-white/60 truncate max-w-[80px]">{p.display_name}</span>
                {p.role === "host" && <Shield className="w-3 h-3 text-accent/60" />}
                {isHost && p.role !== "host" && (
                  <button onClick={() => kick(p.display_name)} className="ml-0.5 text-white/20 hover:text-red-300 transition-colors">
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
