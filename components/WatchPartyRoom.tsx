"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, getImageUrl } from "@/lib/utils";
import { Eye, EyeOff, MessageSquare, Pause, Play, Send, Shield, UserMinus, Users } from "lucide-react";

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

  if (error) {
    return <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">{error}</div>;
  }

  if (!room) {
    return <div className="h-80 animate-pulse rounded-2xl bg-white/[0.04]" />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-2xl">
          {room.backdrop_path ? (
            <img src={getImageUrl(room.backdrop_path, "original") || ""} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm" />
          ) : null}
          <div className="relative aspect-video flex flex-col items-center justify-center bg-black/55 p-6 text-center">
            <p className="text-sm text-white/45">Synced room code</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">{room.code}</h1>
            <p className="mt-3 max-w-xl text-white/75">{room.title}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => sendPlayback("play")} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-white/90">
                <Play className="h-4 w-4" /> Play
              </button>
              <button onClick={() => sendPlayback("pause")} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white hover:bg-white/[0.1]">
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button onClick={() => sendPlayback("seek")} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white hover:bg-white/[0.1]">
                +30s
              </button>
            </div>
            <p className="mt-4 text-xs text-white/45">
              Last sync: {playback.state} at {playback.at}s by {playback.sender}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#141419] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Participants</p>
              <p className="text-xs text-white/40">{participants.length} watching with {room.host_name}</p>
            </div>
            <button onClick={() => setChatOpen((open) => !open)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
              {chatOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {chatOpen ? "Hide Chat" : "Show Chat"}
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                <span className="flex min-w-0 items-center gap-2 text-sm text-white/75">
                  {participant.role === "host" ? <Shield className="h-4 w-4 text-accent" /> : <Users className="h-4 w-4 text-white/35" />}
                  <span className="truncate">{participant.display_name}</span>
                </span>
                {isHost && participant.role !== "host" ? (
                  <button onClick={() => kick(participant.display_name)} className="text-white/35 hover:text-red-300" title="Kick participant">
                    <UserMinus className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className={cn("rounded-2xl border border-white/[0.08] bg-[#111117] xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)]", !chatOpen && "hidden xl:block")}>
        <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            <p className="font-semibold text-white">Room Chat</p>
          </div>
          {isHost ? (
            <button onClick={togglePublic} className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-white/65 hover:text-white">
              {room.is_public ? "Public" : "Private"}
            </button>
          ) : null}
        </div>
        <div className="flex h-[420px] flex-col xl:h-[calc(100%-57px)]">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((item) => (
              <div key={item.id} className="rounded-xl bg-white/[0.04] px-3 py-2">
                <p className="text-xs font-semibold text-accent">{item.display_name}</p>
                <p className="mt-1 text-sm text-white/75">{item.body}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/[0.06] p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
              placeholder="Message the room"
            />
            <button className="rounded-xl bg-accent px-3 text-white hover:bg-accent-hover" title="Send message">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
