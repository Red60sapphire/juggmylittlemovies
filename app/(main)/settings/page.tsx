"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_SETTINGS, UserSettings } from "@/lib/settings";
import { Bell, MonitorPlay, Palette, UserRound, LogOut, Shield, Check } from "lucide-react";
import Link from "next/link";

const LOCAL_KEY = "stremer_settings";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? "bg-accent" : "bg-white/[0.1]"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [synced, setSynced] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const local = localStorage.getItem(LOCAL_KEY);
    if (local) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(local) as Partial<UserSettings> });

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user: { username: string } | null }) => setUsername(data.user?.username || ""))
      .catch(() => {});

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: { settings: UserSettings; synced: boolean }) => {
        setSettings(data.settings);
        setSynced(data.synced);
      })
      .catch(() => {});
  }, []);

  const update = async (patch: Partial<UserSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = (await res.json()) as { synced: boolean };
    setSynced(data.synced);
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemAnim = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="mx-auto max-w-5xl space-y-6">
      <motion.div variants={itemAnim}>
        <p className="text-sm font-semibold text-accent">Preferences</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-sm text-white/45">
          {synced ? "Synced to your account." : "Saved locally on this device."}
          {username ? ` Signed in as ${username}.` : ""}
        </p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.section variants={itemAnim} className="rounded-2xl border border-white/[0.06] bg-[#121218] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
            <MonitorPlay className="h-5 w-5 text-accent" /> Playback
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-white/50 mb-1.5 block">Default server</span>
              <div className="relative">
                <select
                  value={settings.defaultServer}
                  onChange={(event) => update({ defaultServer: event.target.value })}
                  className="w-full appearance-none rounded-xl border border-white/[0.06] bg-[#0a0a0f] px-3 py-3 pr-10 text-sm text-white outline-none focus:border-accent/40 transition-colors"
                >
                  {["Auto", "VidLink", "VidSrc", "Embed.su", "MultiEmbed", "VidKing"].map((server) => (
                    <option key={server}>{server}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </label>
            <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-3 text-sm text-white/70">
              <span>Autoplay next episode</span>
              <Toggle checked={settings.autoplayNext} onChange={(v) => update({ autoplayNext: v })} />
            </label>
            <label className="block">
              <span className="text-sm text-white/50 mb-1.5 block">Subtitles</span>
              <div className="relative">
                <select
                  value={settings.subtitlePreference}
                  onChange={(event) => update({ subtitlePreference: event.target.value })}
                  className="w-full appearance-none rounded-xl border border-white/[0.06] bg-[#0a0a0f] px-3 py-3 pr-10 text-sm text-white outline-none focus:border-accent/40 transition-colors"
                >
                  {["Off", "English", "Auto"].map((option) => <option key={option}>{option}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </label>
          </div>
        </motion.section>

        <motion.section variants={itemAnim} className="rounded-2xl border border-white/[0.06] bg-[#121218] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Palette className="h-5 w-5 text-accent" /> Appearance
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-white/50 mb-1.5 block">Accent color</span>
              <div className="flex gap-3">
                {["Purple", "Blue", "Rose", "Emerald"].map((color) => {
                  const colorMap: Record<string, string> = {
                    Purple: "bg-purple-500",
                    Blue: "bg-blue-500",
                    Rose: "bg-rose-500",
                    Emerald: "bg-emerald-500",
                  };
                  return (
                    <button
                      key={color}
                      onClick={() => update({ accentColor: color })}
                      className={`w-10 h-10 rounded-xl ${colorMap[color]} transition-all ${settings.accentColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-[#121218] scale-110" : "opacity-50 hover:opacity-80"}`}
                    >
                      {settings.accentColor === color && <Check className="w-5 h-5 text-white mx-auto mt-2.5" />}
                    </button>
                  );
                })}
              </div>
            </label>
            <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-3 text-sm text-white/70">
              <span>Reduce motion</span>
              <Toggle checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
            </label>
          </div>
        </motion.section>

        <motion.section variants={itemAnim} className="rounded-2xl border border-white/[0.06] bg-[#121218] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Bell className="h-5 w-5 text-accent" /> Watch Party
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-3 text-sm text-white/70">
              <span>Show chat by default</span>
              <Toggle checked={settings.watchPartyChatOpen} onChange={(v) => update({ watchPartyChatOpen: v })} />
            </label>
            <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-3 text-sm text-white/70">
              <span>Chat notification sound</span>
              <Toggle checked={settings.chatSound} onChange={(v) => update({ chatSound: v })} />
            </label>
          </div>
        </motion.section>

        <motion.section variants={itemAnim} className="rounded-2xl border border-white/[0.06] bg-[#121218] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
            <UserRound className="h-5 w-5 text-accent" /> Account
          </h2>
          {username ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-white/[0.03] px-3 py-3 text-sm text-white/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  {username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{username}</p>
                  <p className="text-xs text-white/40">Signed in</p>
                </div>
              </div>
              <button onClick={signOut} className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] px-4 py-3 text-sm font-medium text-white/50 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.03] px-3 py-4 text-sm text-white/50 text-center">
              <Shield className="mx-auto h-6 w-6 mb-2 text-white/20" />
              <p>Sign in to sync settings across devices.</p>
              <Link href="/login" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-hover transition-all">
                Sign in
              </Link>
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}
