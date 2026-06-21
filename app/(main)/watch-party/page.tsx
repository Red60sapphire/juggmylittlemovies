"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import { DoorOpen, Users, Settings, Hash, AlertCircle, Globe } from "lucide-react";
import Link from "next/link";

interface PublicRoom {
  id: string;
  code: string;
  title: string;
  poster_path: string | null;
  host_name: string;
  participant_count: number;
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
};

export default function WatchPartyPage() {
  const router = useRouter();
  const [configured, setConfigured] = useState(true);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");

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

  const join = async (roomId?: string) => {
    setError("");
    const res = await fetch("/api/watch-party/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, roomId, displayName }),
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
        <div className="rounded-2xl border border-white/[0.06] bg-[#121218] p-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-white/20" />
          </div>
          <h1 className="text-2xl font-bold text-white">Watch Parties Unavailable</h1>
          <p className="mt-3 text-sm text-white/50">Supabase needs to be configured for watch parties to work.</p>
          <Link href="/settings" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-hover transition-all">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-8">
      <motion.section variants={itemAnim} className="rounded-2xl border border-white/[0.06] bg-[#121218] p-5 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Watch Together</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Join a room</h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">Enter a six digit code to join an existing room.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto] w-full md:w-auto">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border border-white/[0.06] bg-[#0a0a0f] pl-9 pr-4 py-3 text-white text-sm outline-none focus:border-accent/40 transition-colors"
                placeholder="123456"
              />
            </div>
            {!accountName ? (
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#0a0a0f] px-4 py-3 text-white text-sm outline-none focus:border-accent/40 transition-colors"
                placeholder="Display name"
              />
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] px-4 py-3 text-sm text-white/60 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent/60" />
                {accountName}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => join()}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-hover transition-all"
            >
              <DoorOpen className="h-4 w-4" /> Join
            </motion.button>
          </div>
        </div>
        <AnimatePresence>
          {error ? (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              <AlertCircle className="inline w-4 h-4 mr-1.5 -mt-0.5" />
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.section>

      <motion.section variants={itemAnim}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-accent rounded-full" />
          <h2 className="text-xl font-bold text-white">Public rooms</h2>
          <p className="text-sm text-white/35">{rooms.length} live</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room, i) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => join(room.id)}
              className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121218] text-left transition hover:border-accent/40 hover:bg-white/[0.04]"
            >
              <div className="aspect-video bg-white/[0.03] relative">
                {room.poster_path ? (
                  <img src={getImageUrl(room.poster_path, "w500") || ""} alt="" className="h-full w-full object-cover opacity-70 transition group-hover:opacity-100" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Hash className="w-3 h-3" /> {room.code}
                </div>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-bold text-white">{room.title}</h3>
                <p className="mt-1 text-sm text-white/40">by {room.host_name}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-white/50">
                  <Users className="h-4 w-4" /> {room.participant_count} watching
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
