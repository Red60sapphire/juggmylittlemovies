"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_SETTINGS, UserSettings } from "@/lib/settings";
import { Bell, MonitorPlay, Palette, Shield, UserRound } from "lucide-react";

const LOCAL_KEY = "stremer_settings";

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <p className="text-sm font-semibold text-accent">Preferences</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-sm text-white/45">{synced ? "Synced to your account." : "Saved locally on this device."}</p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><MonitorPlay className="h-5 w-5 text-accent" /> Playback</h2>
          <label className="block text-sm text-white/65">
            Default server
            <select value={settings.defaultServer} onChange={(event) => update({ defaultServer: event.target.value })} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#0f0f15] px-3 py-3 text-white outline-none">
              {["Auto", "VidLink", "VidSrc", "Embed.su", "MultiEmbed", "VidKing"].map((server) => <option key={server}>{server}</option>)}
            </select>
          </label>
          <label className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-white/70">
            Autoplay next episode
            <input type="checkbox" checked={settings.autoplayNext} onChange={(event) => update({ autoplayNext: event.target.checked })} />
          </label>
          <label className="mt-4 block text-sm text-white/65">
            Subtitles
            <select value={settings.subtitlePreference} onChange={(event) => update({ subtitlePreference: event.target.value })} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#0f0f15] px-3 py-3 text-white outline-none">
              {["Off", "English", "Auto"].map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Palette className="h-5 w-5 text-accent" /> Appearance</h2>
          <label className="block text-sm text-white/65">
            Accent color
            <select value={settings.accentColor} onChange={(event) => update({ accentColor: event.target.value })} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#0f0f15] px-3 py-3 text-white outline-none">
              {["Purple", "Blue", "Rose", "Emerald"].map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-white/70">
            Reduce motion
            <input type="checkbox" checked={settings.reduceMotion} onChange={(event) => update({ reduceMotion: event.target.checked })} />
          </label>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Bell className="h-5 w-5 text-accent" /> Watch Party</h2>
          <label className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-white/70">
            Show chat by default
            <input type="checkbox" checked={settings.watchPartyChatOpen} onChange={(event) => update({ watchPartyChatOpen: event.target.checked })} />
          </label>
          <label className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-white/70">
            Chat notification sound
            <input type="checkbox" checked={settings.chatSound} onChange={(event) => update({ chatSound: event.target.checked })} />
          </label>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/[0.08] bg-[#141419] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><UserRound className="h-5 w-5 text-accent" /> Account</h2>
          {username ? (
            <div className="space-y-3">
              <p className="rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-white/70">Signed in as <span className="font-semibold text-white">{username}</span></p>
              <button onClick={signOut} className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/[0.06]">Sign out</button>
              <p className="text-xs text-white/35">Username, password, and delete-account actions are backed by the profiles table and can be extended from this section.</p>
            </div>
          ) : (
            <p className="rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-white/55"><Shield className="mr-2 inline h-4 w-4" /> Sign in to sync settings across devices.</p>
          )}
        </motion.section>

      </div>
    </motion.div>
  );
}
