"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import {
  DoorOpen, Users, Hash, Globe, Play, Plus, Search, X,
  Film, ArrowRight, UserRound, AlertCircle, Settings,
} from "lucide-react";
import Link from "next/link";

interface PublicRoom {
  id: string;
  code: string;
  title: string;
  poster_path: string | null;
  host_name: string;
  participant_count: number;
}

interface MovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: string;
}

export default function WatchPartyPage() {
  const router = useRouter();
  const [configured, setConfigured] = useState(true);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [displayName, setDisplayName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [searching, setSearching] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<any>(null);

  useEffect(() => {
    codeRefs.current = codeRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: { username: string } | null }) => setAccountName(d.user?.username || ""))
      .catch(() => {});
    fetch("/api/watch-party/rooms")
      .then((r) => r.json())
      .then((d: { configured: boolean; rooms: PublicRoom[] }) => {
        setConfigured(d.configured);
        setRooms(d.rooms || []);
      })
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}&page=1`);
        const data = await res.json();
        setSearchResults((data.results || []).slice(0, 8));
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      pasted.forEach((char, i) => { if (i < 6) newCode[i] = char; });
      setCode(newCode);
      const next = pasted.length < 6 ? pasted.length : 5;
      codeRefs.current[next]?.focus();
      if (pasted.length === 6) setTimeout(() => setShowJoin(false), 300);
      return;
    }
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const joinRoom = async () => {
    setError("");
    const fullCode = code.join("");
    if (fullCode.length !== 6) { setError("Enter a valid 6-digit code."); return; }
    if (!displayName.trim()) { setError("Enter a display name."); return; }
    const res = await fetch("/api/watch-party/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: fullCode, displayName: displayName.trim() }),
    });
    const data = (await res.json()) as { roomId?: string; error?: string };
    if (!res.ok || !data.roomId) { setError(data.error || "Could not join room."); return; }
    sessionStorage.setItem(`watch-party-name:${data.roomId}`, displayName.trim());
    router.push(`/watch-party/${data.roomId}`);
  };

  const joinPublicRoom = async (roomId: string) => {
    setError("");
    const name = displayName || accountName || "Guest";
    const res = await fetch("/api/watch-party/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, displayName: name }),
    });
    const data = (await res.json()) as { roomId?: string; error?: string };
    if (!res.ok || !data.roomId) { setError(data.error || "Could not join room."); return; }
    sessionStorage.setItem(`watch-party-name:${data.roomId}`, name);
    router.push(`/watch-party/${data.roomId}`);
  };

  const createRoom = async () => {
    if (!selectedMovie) return;
    setCreating(true);
    setError("");
    const name = displayName || accountName || "Host";
    try {
      const res = await fetch("/api/watch-party/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          title: selectedMovie.title,
          posterPath: selectedMovie.poster_path,
          displayName: name,
        }),
      });
      const data = (await res.json()) as { roomId?: string; displayName?: string; hostKey?: string; error?: string };
      if (!res.ok || !data.roomId) { setError(data.error || "Could not create room."); return; }
      sessionStorage.setItem(`watch-party-name:${data.roomId}`, data.displayName || name);
      if (data.hostKey) sessionStorage.setItem(`watch-party-host:${data.roomId}`, data.hostKey);
      router.push(`/watch-party/${data.roomId}`);
    } catch {
      setError("Could not create room.");
    }
    setCreating(false);
  };

  const openCreate = () => {
    setSelectedMovie(null);
    setSearchQuery("");
    setDisplayName("");
    setError("");
    setShowCreate(true);
  };

  if (!configured) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 ring-1 ring-white/5">
            <AlertCircle className="h-8 w-8 text-white/20" />
          </div>
          <h1 className="text-2xl font-bold text-white">Watch Parties Unavailable</h1>
          <p className="mt-3 text-sm text-white/50">Supabase needs to be configured for watch parties to work.</p>
          <Link href="/settings" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#1a0a2e] p-8 md:p-12 shadow-2xl shadow-black/40"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Watch Together</h1>
          <p className="text-white/50 max-w-md text-sm md:text-base">
            Start or join a watch party to sync playback with friends in real time.
          </p>
        </div>
      </motion.div>

      {/* Action cards */}
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowJoin(true)}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-8 text-left transition-all hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 ring-1 ring-accent/20">
              <DoorOpen className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Join a Room</h2>
            <p className="text-sm text-white/40 mb-4">Enter a 6-digit code to join a friend&apos;s watch party.</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
              Enter code <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-8 text-left transition-all hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/5"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
              <Plus className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Create a Room</h2>
            <p className="text-sm text-white/40 mb-4">Pick a movie or show and invite friends to watch together.</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:gap-3 transition-all">
              Get started <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.button>
      </div>

      {/* Public rooms */}
      {rooms.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="text-lg font-bold text-white">Public rooms</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
              {rooms.length} live
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room, i) => (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => joinPublicRoom(room.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14] text-left transition-all hover:border-accent/40 hover:bg-white/[0.02] shadow-lg"
              >
                <div className="aspect-video relative overflow-hidden bg-white/[0.02]">
                  {room.poster_path ? (
                    <img src={getImageUrl(room.poster_path, "w500") || ""} alt="" className="h-full w-full object-cover opacity-60 transition-all duration-500 group-hover:opacity-90 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Globe className="w-10 h-10 text-white/10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-white/90">
                    <Hash className="w-3 h-3" /> {room.code}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-accent/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-white" /> Join
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white truncate group-hover:text-accent transition-colors">{room.title}</h3>
                  <p className="mt-1 text-sm text-white/40">by {room.host_name}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-white/40">
                    <Users className="h-3.5 w-3.5" />
                    <span>{room.participant_count} watching</span>
                    <span className="text-white/20">&bull;</span>
                    <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-green-400/60 animate-pulse" /> Live</span>
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Join Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-6 shadow-2xl"
            >
              <button onClick={() => setShowJoin(false)} className="absolute right-4 top-4 text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <DoorOpen className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-white">Enter Room Code</h2>
                <p className="text-sm text-white/40 mt-1">Ask the host for the 6-digit code</p>
              </div>
              <div className="flex gap-2.5 justify-center mb-6" dir="ltr">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el; }}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    inputMode="numeric"
                    maxLength={6}
                    className="w-12 h-14 md:w-14 md:h-16 rounded-xl border border-white/[0.08] bg-black/40 text-center text-2xl font-black text-white outline-none transition-all focus:border-accent/60 focus:shadow-lg focus:shadow-accent/10"
                    style={{ caretColor: "transparent" }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal - Two Step */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-6 shadow-2xl"
            >
              <button onClick={() => setShowCreate(false)} className="absolute right-4 top-4 text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Create a Room</h2>
                <p className="text-sm text-white/40 mt-1">
                  {selectedMovie ? "Enter your display name to continue" : "Search for a movie or show"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Step 1: Search */}
                {!selectedMovie && (
                  <div className="relative">
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 focus-within:border-accent/40 transition-all">
                      <Search className="h-4 w-4 text-white/20 flex-shrink-0" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                        placeholder="Search movies and shows..."
                      />
                      {searching && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin flex-shrink-0" />}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-64 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#0a0a10] p-2">
                        {searchResults.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedMovie(m); setSearchResults([]); setSearchQuery(""); }}
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/[0.04] transition-all text-left"
                          >
                            <div className="w-8 h-12 rounded-lg overflow-hidden bg-white/[0.04] flex-shrink-0">
                              {m.poster_path ? (
                                <img src={getImageUrl(m.poster_path, "w92")} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Film className="w-3 h-3 text-white/20" /></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{m.title}</p>
                              <p className="text-xs text-white/30">{m.media_type === "tv" ? "TV Show" : "Movie"}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                      <p className="text-sm text-white/30 text-center py-4">No results found</p>
                    )}
                  </div>
                )}

                {/* Selected movie display */}
                {selectedMovie && (
                  <div className="flex items-center gap-3 rounded-xl bg-accent/5 border border-accent/20 p-3">
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/[0.04] flex-shrink-0">
                      {selectedMovie.poster_path ? (
                        <img src={getImageUrl(selectedMovie.poster_path, "w92")} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-white/20" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{selectedMovie.title}</p>
                      <p className="text-xs text-white/40">{selectedMovie.media_type === "tv" ? "TV Show" : "Movie"}</p>
                    </div>
                    <button onClick={() => setSelectedMovie(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Step 2: Name input */}
                {selectedMovie && (
                  <div className="relative">
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 focus-within:border-accent/40 transition-all">
                      <UserRound className="h-4 w-4 text-white/20 flex-shrink-0" />
                      <input
                        ref={nameInputRef}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                        placeholder={accountName || "Your display name (host)"}
                        maxLength={24}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-200 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {selectedMovie && (
                  <button
                    onClick={createRoom}
                    disabled={creating}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    {creating ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Create Room</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
