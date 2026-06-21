"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WatchParty, WatchPartyMember } from "@/types";
import {
  Users, Copy, Check, Play, LogOut, Share2, UserPlus,
} from "lucide-react";

interface Props {
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  backdropPath: string | null;
  isTv?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
  onSeek?: (time: number) => void;
  onPause?: () => void;
  onPlay?: () => void;
  playerRef?: { current: { seekTo: (t: number) => void; playVideo: () => void; pauseVideo: () => void } | null };
}

export default function WatchPartyUI({
  movieId,
  movieTitle,
  posterPath,
  backdropPath,
  isTv,
  seasonNumber,
  episodeNumber,
  onSeek,
  playerRef,
}: Props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [party, setParty] = useState<WatchParty | null>(null);
  const [members, setMembers] = useState<WatchPartyMember[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setLoggedIn(!!d.user)).catch(() => {});
  }, []);

  const createParty = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/watchparty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id: movieId,
          movie_title: movieTitle,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          is_tv: isTv || false,
          season_number: seasonNumber || null,
          episode_number: episodeNumber || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setParty(data);
      setIsHost(true);
    } catch { setError("Failed to create party"); }
    setLoading(false);
  };

  const joinParty = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/watchparty/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setParty(data);
      setIsHost(false);
      setShowInviteInput(false);
    } catch { setError("Failed to join party"); }
    setLoading(false);
  };

  const fetchMembers = useCallback(async (partyId: string) => {
    try {
      const res = await fetch(`/api/watchparty/${partyId}/members`);
      const data = await res.json();
      setMembers(data);
    } catch {}
  }, []);

  const fetchParty = useCallback(async (partyId: string) => {
    try {
      const res = await fetch(`/api/watchparty/${partyId}`);
      const data = await res.json();
      if (data.current_time !== undefined) setParty(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (!party) return;
    fetchMembers(party.id);
    fetchParty(party.id);
    pollRef.current = setInterval(() => {
      fetchParty(party.id);
      fetchMembers(party.id);
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [party?.id]);

  const endParty = async () => {
    if (!party) return;
    try {
      await fetch(`/api/watchparty/${party.id}`, { method: "DELETE" });
      setParty(null);
      setMembers([]);
      setIsHost(false);
    } catch {}
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/watch/party?code=${party?.invite_code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const leaveParty = async () => {
    if (!party) return;
    try {
      await fetch(`/api/watchparty/${party.id}/members`, { method: "DELETE" });
    } catch {}
    setParty(null);
    setMembers([]);
  };

  if (!loggedIn) return null;

  if (!party) {
    return (
      <div className="mt-4 rounded-xl bg-[#171717] border border-[#2A2A2A] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-white">Watch Party</h3>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={createParty}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {loading ? "Creating..." : "Create Watch Party"}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-xs text-[#9CA3AF]">or</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>
          {showInviteInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                maxLength={6}
                className="flex-1 px-3 py-2 bg-[#1B1B1B] border border-[#2A2A2A] rounded-xl text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-accent/50 uppercase tracking-widest text-center font-mono"
                onKeyDown={(e) => e.key === "Enter" && joinParty()}
              />
              <button
                onClick={joinParty}
                disabled={loading || !inviteCode.trim()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                Join
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowInviteInput(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Join with Code
            </button>
          )}
          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 rounded-xl bg-[#171717] border border-[#2A2A2A] overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Watch Party</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyInviteLink}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-all active:scale-90 relative"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              {isHost ? (
                <button
                  onClick={endParty}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all active:scale-90"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={leaveParty}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-all active:scale-90"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold bg-accent/20 text-accent px-2 py-1 rounded-md tracking-widest">
              {party.invite_code}
            </span>
            <span className="text-xs text-[#9CA3AF]">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
            {party.status === "playing" && (
              <span className="flex items-center gap-1 text-[10px] text-green-500 ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          <div className="flex -space-x-2">
            {members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="w-8 h-8 rounded-full bg-accent/20 border-2 border-[#171717] flex items-center justify-center"
                title={m.display_name || "Member"}
              >
                <span className="text-[10px] font-bold text-accent">
                  {(m.display_name || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            ))}
            {members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-[#2A2A2A] border-2 border-[#171717] flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#9CA3AF]">+{members.length - 5}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
