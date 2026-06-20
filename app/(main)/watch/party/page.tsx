"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const [inviteCode, setInviteCode] = useState(code || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [party, setParty] = useState<any>(null);

  useEffect(() => {
    if (code) {
      joinParty(code);
    }
  }, [code]);

  const joinParty = async (customCode?: string) => {
    const codeToUse = customCode || inviteCode;
    if (!codeToUse.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/watchparty/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: codeToUse.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setParty(data);
    } catch { setError("Failed to join party"); }
    setLoading(false);
  };

  const handleGoToMovie = () => {
    if (!party) return;
    const path = party.is_tv
      ? `/watch/tv/${party.movie_id}/${party.season_number || 1}/${party.episode_number || 1}`
      : `/watch/movie/${party.movie_id}`;
    router.push(path);
  };

  return (
    <main id="main-content" className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {party ? (
          <div className="rounded-2xl bg-[#171717] border border-[#2A2A2A] p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Party Found!</h1>
            <p className="text-sm text-[#9CA3AF] mb-2">{party.movie_title}</p>
            <p className="text-xs text-[#555] mb-6">Code: <span className="font-mono font-bold text-accent tracking-widest">{party.invite_code}</span></p>
            <button
              onClick={handleGoToMovie}
              className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all active:scale-95"
            >
              Join Watch Party
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#171717] border border-[#2A2A2A] p-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-white text-center mb-1">Join Watch Party</h1>
            <p className="text-sm text-[#9CA3AF] text-center mb-6">Enter the invite code from the host</p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full px-4 py-3 bg-[#1B1B1B] border border-[#2A2A2A] rounded-xl text-lg text-white placeholder:text-[#555] focus:outline-none focus:border-accent/50 text-center font-mono tracking-[0.5em] mb-4"
              onKeyDown={(e) => e.key === "Enter" && joinParty()}
            />
            {error && (
              <p className="text-xs text-red-400 text-center mb-3">{error}</p>
            )}
            <button
              onClick={() => joinParty()}
              disabled={loading || !inviteCode.trim()}
              className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Party"}
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}

export default function WatchPartyJoinPage() {
  return (
    <Suspense fallback={
      <main id="main-content" className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    }>
      <JoinContent />
    </Suspense>
  );
}
