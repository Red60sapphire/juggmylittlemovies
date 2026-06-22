"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, getImageUrl } from "@/lib/utils";
import {
  Eye, EyeOff, MessageSquare, Pause, Play, Send, Shield, UserMinus, Users,
  Copy, Check, Hash, ArrowLeft, Tv,
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

interface PlaybackEvent {
  state: "play" | "pause" | "seek";
  at: number;
  sender: string;
}

interface WatchPartyRoomProps {
  roomId: string;
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
  const [playback, setPlayback] = useState<PlaybackEvent>({ state: "pause", at: 0, sender: "system" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedName = sessionStorage.getItem(`watch-party-name:${roomId}`) || "";
    const storedHostKey = sessionStorage.getItem(`watch-party-host:${roomId}`) || "";
    setDisplayName(storedName);
    setHostKey(storedHostKey);

    fetch(`/api/watch-party/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data: { room: Room; participants: Participant[]; messages: Message[]; isHost: boolean; user?: { username: string } | null; error?: string }) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setRoom(data.room);
        setParticipants(data.participants);
        setMessages(data.messages);
        setIsHost(data.isHost || Boolean(storedHostKey) || data.participants.some((p) => p.display_name === storedName && p.role === "host"));
        if (data.user?.username) setDisplayName(data.user.username);
      })
      .catch(() => setError("Could not load this room."));
  }, [roomId]);

  useEffect(() => {
    if (!supabase || !room) return;
    const channel = supabase.channel(`watch-party:${room.id}`, {
      config: { presence: { key: displayName || "guest" } },
    });

    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((current) => [...current, payload as Message].slice(-100));
      })
      .on("broadcast", { event: "playback" }, ({ payload }) => {
        setPlayback(payload as PlaybackEvent);
      })
      .on("broadcast", { event: "participants" }, () => refreshParticipants())
      .on("broadcast", { event: "kicked" }, ({ payload }) => {
        if ((payload as { displayName: string }).displayName === displayName) {
          router.push("/watch-party?kicked=1");
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ displayName, online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [displayName, room, router, supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const refreshParticipants = async () => {
    const res = await fetch(`/api/watch-party/rooms/${roomId}`);
    const data = (await res.json()) as { participants?: Participant[] };
    setParticipants(data.participants || []);
  };

  const broadcast = async (event: string, payload: unknown) => {
    if (!supabase || !room) return;
    await supabase.channel(`watch-party:${room.id}`).send({ type: "broadcast", event, payload });
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    const res = await fetch(`/api/watch-party/rooms/${roomId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: message, displayName }),
    });
    const data = (await res.json()) as { message?: Message; error?: string };
    if (!res.ok || !data.message) {
      setError(data.error || "Could not send message.");
      return;
    }
    setMessage("");
    await broadcast("message", data.message);
  };

  const sendPlayback = async (state: PlaybackEvent["state"]) => {
    const next = { state, at: state === "seek" ? playback.at + 30 : playback.at, sender: displayName || "Guest" };
    setPlayback(next);
    await broadcast("playback", next);
  };

  const togglePublic = async () => {
    if (!room) return;
    const next = !room.is_public;
    const res = await fetch(`/api/watch-party/rooms/${room.id}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: next, hostKey }),
    });
    if (res.ok) {
      setRoom({ ...room, is_public: next });
      await broadcast("participants", {});
    }
  };

  const kick = async (name: string) => {
    if (!room) return;
    const res = await fetch(`/api/watch-party/rooms/${room.id}/kick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name, hostKey }),
    });
    if (res.ok) {
      await refreshParticipants();
      await broadcast("kicked", { displayName: name });
    }
  };

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 xl:grid-cols-[1fr_360px]"
    >
      <div className="min-w-0 space-y-4">
        {/* Room Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-2xl">
          {room.backdrop_path ? (
            <img src={getImageUrl(room.backdrop_path, "original") || ""} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm scale-105" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          <div className="relative aspect-video flex flex-col items-center justify-center p-6 md:p-8 text-center">
            {/* Animated room code */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Live
              </div>
            </div>
            <button
              onClick={copyCode}
              className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.1] transition-all mb-2"
            >
              <Hash className="w-5 h-5 text-accent/60" />
              <span className="text-4xl md:text-5xl font-black tracking-[0.2em] text-white">{room.code}</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-xs text-white/50 group-hover:text-white transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </div>
            </button>
            <p className="text-white/60 font-medium">{room.title}</p>
            <p className="text-sm text-white/40 mt-1">Hosted by {room.host_name}</p>

            {/* Playback controls */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => sendPlayback("play")}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-white/90 transition-all active:scale-95 shadow-lg"
              >
                <Play className="h-4 w-4 fill-black" /> Play
              </button>
              <button
                onClick={() => sendPlayback("pause")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white hover:bg-white/[0.1] transition-all active:scale-95 backdrop-blur-sm"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button
                onClick={() => sendPlayback("seek")}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white hover:bg-white/[0.1] transition-all active:scale-95 backdrop-blur-sm"
              >
                +30s
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              Last sync: {playback.state} at {playback.at}s by {playback.sender}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c14]/80 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Participants</p>
                <p className="text-xs text-white/40">{participants.length} in room</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen((open) => !open)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              {chatOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {chatOpen ? "Hide Chat" : "Show Chat"}
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5"
              >
                <span className="flex min-w-0 items-center gap-2.5 text-sm text-white/75">
                  <span className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">
                    {participant.display_name[0].toUpperCase()}
                  </span>
                  <span className="truncate">{participant.display_name}</span>
                  {participant.role === "host" && (
                    <Shield className="h-3 w-3 text-accent flex-shrink-0" />
                  )}
                </span>
                {isHost && participant.role !== "host" ? (
                  <button
                    onClick={() => kick(participant.display_name)}
                    className="text-white/25 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                    title="Kick participant"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Movie link */}
        <Link
          href={`/watch/${room.movie_id}`}
          className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c0c14]/80 backdrop-blur-sm p-4 hover:bg-white/[0.04] transition-all group"
        >
          {room.poster_path ? (
            <img src={getImageUrl(room.poster_path, "w92") || ""} alt="" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-16 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
              <Tv className="w-5 h-5 text-white/20" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-white/40">Now watching</p>
            <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">{room.title}</p>
          </div>
          <Play className="w-4 h-4 text-white/30 ml-auto flex-shrink-0 group-hover:text-accent transition-colors" />
        </Link>
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
            <button
              onClick={togglePublic}
              className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs text-white/50 hover:text-white transition-colors"
            >
              {room.is_public ? "Public" : "Private"}
            </button>
          ) : null}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white/[0.03] px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-accent">{item.display_name}</span>
                    <span className="text-[10px] text-white/20">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{item.body}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/[0.06] p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-accent/40 transition-colors"
              placeholder="Message the room..."
            />
            <button
              className="rounded-xl bg-accent px-3.5 text-white hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50"
              title="Send message"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>
    </motion.div>
  );
}
