"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import { DoorOpen, Users, Settings, Hash, AlertCircle, Globe, Sparkles, Play, Tv } from "lucide-react";
import Link from "next/link";

interface PublicRoom {
  id: string;
  code: string;
  title: string;
  poster_path: string | null;
  host_name: string;
  participant_count: number;
}

export default function WatchPartyPage() {
  const router = useRouter();
  const [configured, setConfigured] = useState(true);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [displayName, setDisplayName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const codeRefs = Array.from({ length: 6 }, () => useState<HTMLInputElement | null>(null));

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("kicked")) {
      setError("You were removed from that room.");
    }
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user: { username: string } | null }) => setAccountName(data.user?.username || ""))
      .catch(() => {});

    fetch("/api/watch-party/rooms")
      .then((res) => res.json())
      .then((data: { configured: boolean; rooms: PublicRoom[] }) => {
        setConfigured(data.configured);
        setRooms(data.rooms || []);
      })
      .catch(() => setConfigured(false));
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      pasted.forEach((char, i) => { if (i < 6) newCode[i] = char; });
      setCode(newCode);
      const nextEmpty = pasted.length < 6 ? pasted.length : 5;
      const ref = codeRefs[nextEmpty];
      if (ref) ref[1](ref[0]);
      return;
    }
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) {
      const ref = codeRefs[index + 1];
      if (ref) ref[1](ref[0]);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const ref = codeRefs[index - 1];
      if (ref) ref[1](ref[0]);
    }
  };

  const join = async (roomId?: string) => {
    setError("");
    const fullCode = roomId ? "" : code.join("");
    if (!roomId && fullCode.length !== 6) {
      setError("Enter a valid 6-digit room code.");
      return;
    }
    const res = await fetch("/api/watch-party/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: fullCode, roomId, displayName }),
    });
    const data = (await res.json()) as { roomId?: string; displayName?: string; error?: string };
    if (!res.ok || !data.roomId) {
      setError(data.error || "Could not join room.");
      return;
    }
    sessionStorage.setItem(`watch-party-name:${data.roomId}`, data.displayName || accountName || displayName);
    router.push(`/watch-party/${data.roomId}`);
  };

  if (!configured) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md text-center">
        <div className="relative rounded-2xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/[0.06] p-10 shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 ring-1 ring-white/5">
            <AlertCircle className="h-8 w-8 text-white/20" />
          </div>
          <h1 className="text-2xl font-bold text-white">Watch Parties Unavailable</h1>
          <p className="mt-3 text-sm text-white/50">Supabase needs to be configured for watch parties to work.</p>
          <Link href="/settings" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0c0c1a] to-[#0c0c14] p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-widest">
              <Tv className="w-3.5 h-3.5" />
              Watch Together
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Join a room</h1>
            <p className="text-sm text-white/40 max-w-lg">Enter the 6-digit code shared by the host to join their watch party.</p>
          </div>

          <div className="flex-shrink-0">
            {!accountName ? (
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="rounded-xl border border-white/[0.06] bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-accent/40 transition-colors w-full md:w-48 backdrop-blur-sm"
                placeholder="Your display name"
              />
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-black/40 px-4 py-3 text-sm text-white/60 flex items-center gap-2 backdrop-blur-sm">
                <Users className="w-4 h-4 text-accent/60" />
                {accountName}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Code input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-5 rounded-2xl border border-white/[0.06] bg-[#0c0c14]/80 backdrop-blur-sm p-6 md:p-8"
      >
        <div className="text-center">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Room Code</p>
          <p className="text-sm text-white/50 mt-1">Ask the host for the 6-digit code</p>
        </div>
        <div className="flex gap-2.5" dir="ltr">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { if (el) codeRefs[i][1](el); }}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              maxLength={6}
              className="w-11 h-14 md:w-14 md:h-16 rounded-xl border border-white/[0.08] bg-black/40 text-center text-2xl font-black text-white outline-none transition-all focus:border-accent/60 focus:shadow-lg focus:shadow-accent/10 backdrop-blur-sm"
              style={{ caretColor: "transparent" }}
            />
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => join()}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
        >
          <DoorOpen className="h-4 w-4" /> Join Room
        </motion.button>

        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-200 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Public rooms */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 bg-accent rounded-full" />
          <h2 className="text-xl font-bold text-white">Public rooms</h2>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {rooms.length} live
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c14]/60 backdrop-blur-sm p-10 text-center">
            <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white/50">No public rooms right now</p>
            <p className="text-xs text-white/30 mt-1">Start a watch party from any movie to see it here.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room, i) => (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => join(room.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14]/80 backdrop-blur-sm text-left transition-all hover:border-accent/40 hover:bg-white/[0.04] shadow-lg shadow-black/20"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="aspect-video bg-white/[0.02] relative overflow-hidden">
                  {room.poster_path ? (
                    <img src={getImageUrl(room.poster_path, "w500") || ""} alt="" className="h-full w-full object-cover opacity-60 transition-all duration-500 group-hover:opacity-90 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Globe className="w-10 h-10 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-white/90">
                    <Hash className="w-3 h-3" /> {room.code}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-accent/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    Join
                  </div>
                </div>
                <div className="relative p-4 z-10">
                  <h3 className="line-clamp-1 font-bold text-white group-hover:text-accent transition-colors">{room.title}</h3>
                  <p className="mt-1 text-sm text-white/40">by {room.host_name}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-white/40">
                    <Users className="h-3.5 w-3.5" />
                    <span>{room.participant_count} watching</span>
                    <span className="text-white/20">•</span>
                    <span className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-green-400/60 animate-pulse" />
                      Live
                    </span>
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
