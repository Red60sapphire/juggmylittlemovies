"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import type { UserSettings } from "@/lib/settings";
import Link from "next/link";
import { Check } from "lucide-react";

const LOCAL_KEY = "stremer_settings";

const ACCENTS = [
  { name: "Purple", class: "bg-[#8b5cf6]", ring: "ring-[#8b5cf6]" },
  { name: "Blue", class: "bg-[#3b82f6]", ring: "ring-[#3b82f6]" },
  { name: "Rose", class: "bg-[#f43f5e]", ring: "ring-[#f43f5e]" },
  { name: "Emerald", class: "bg-[#10b981]", ring: "ring-[#10b981]" },
  { name: "Amber", class: "bg-[#f59e0b]", ring: "ring-[#f59e0b]" },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-2.5 cursor-pointer group">
      <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0 ${checked ? "bg-accent" : "bg-white/[0.1] hover:bg-white/[0.15]"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-4.5" : "translate-x-0"}`} />
      </button>
    </label>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="block">
      <span className="text-sm text-white/50 mb-1.5 block">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 pr-9 text-sm text-white outline-none focus:border-accent/50 transition-colors cursor-pointer"
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </label>
  );
}

function Card({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="flex items-center gap-2 text-sm font-bold text-white mb-4 pb-3 border-b border-border/60">
        {icon && <span className="text-accent">{icon}</span>}
        {title}
      </h2>
      <div className="space-y-1">
        {children}
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [synced, setSynced] = useState(false);
  const [username, setUsername] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const local = localStorage.getItem(LOCAL_KEY);
    if (local) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(local) as Partial<UserSettings> });

    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUsername(d.user?.username || "")).catch(() => {});
    fetch("/api/settings").then((r) => r.json()).then((d) => { setSettings(d.settings); setSynced(d.synced); }).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const update = async (patch: Partial<UserSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    const data = await res.json();
    setSynced(data.synced);
    showToast("Setting saved");
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="mb-6">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider">Preferences</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Settings</h1>
        <p className="mt-1.5 text-sm text-muted">
          {synced ? "Synced to your account." : "Saved locally."}
          {username ? ` Signed in as ${username}.` : ""}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Playback" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
          <Select label="Default server" value={settings.defaultServer} onChange={(v) => update({ defaultServer: v })} options={["Auto", "VidLink", "VidSrc", "Embed.su", "MultiEmbed", "VidKing"]} />
          <div className="border-t border-border/40 my-2" />
          <Toggle label="Autoplay next episode" checked={settings.autoplayNext} onChange={(v) => update({ autoplayNext: v })} />
          <Toggle label="Autoplay previews on hover" checked={settings.autoplayNext} onChange={(v) => update({ autoplayNext: v })} />
          <div className="border-t border-border/40 my-2" />
          <Select label="Default subtitles" value={settings.subtitlePreference} onChange={(v) => update({ subtitlePreference: v })} options={["Off", "English", "Auto"]} />
          <Select label="Default audio" value="English" onChange={() => {}} options={["English", "Japanese", "Spanish"]} />
        </Card>

        <Card title="Appearance" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}>
          <span className="text-sm text-white/50 mb-2 block">Accent color</span>
          <div className="flex gap-2.5 mb-3">
            {ACCENTS.map((c) => (
              <button
                key={c.name}
                onClick={() => update({ accentColor: c.name })}
                className={`w-8 h-8 rounded-lg ${c.class} transition-all ${settings.accentColor === c.name ? `ring-2 ring-white ring-offset-1 ring-offset-surface scale-110` : "opacity-50 hover:opacity-80"}`}
              >
                {settings.accentColor === c.name && <Check className="w-4 h-4 text-white mx-auto mt-2" />}
              </button>
            ))}
          </div>
          <div className="border-t border-border/40 my-2" />
          <Select label="Theme" value="Dark" onChange={() => {}} options={["Dark", "Light", "System"]} />
          <Select label="Layout density" value="Comfortable" onChange={() => {}} options={["Comfortable", "Compact"]} />
          <Toggle label="Reduce motion" checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
        </Card>

        <Card title="Notifications" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}>
          <Toggle label="New episode alerts" checked={true} onChange={() => {}} />
          <Toggle label="Recommendation emails" checked={false} onChange={() => {}} />
          <Toggle label="Push notifications" checked={true} onChange={() => {}} />
        </Card>

        <Card title="Content & Privacy" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}>
          <Select label="Content maturity" value="All" onChange={() => {}} options={["All", "Teen", "Mature (18+)"]} />
          <div className="border-t border-border/40 my-2" />
          <button className="w-full text-left text-sm text-white/60 hover:text-white/90 py-2.5 transition-colors">Clear watch history</button>
          <button className="w-full text-left text-sm text-white/60 hover:text-white/90 py-2.5 transition-colors">Clear search history</button>
        </Card>

        <Card title="Watch Party" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
          <Toggle label="Show chat by default" checked={settings.watchPartyChatOpen} onChange={(v) => update({ watchPartyChatOpen: v })} />
          <Toggle label="Chat notification sound" checked={settings.chatSound} onChange={(v) => update({ chatSound: v })} />
        </Card>

        <Card title="Account" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
          {username ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm">
                  {username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{username}</p>
                  <p className="text-xs text-muted">Signed in</p>
                </div>
              </div>
              <div className="border-t border-border/40 my-2" />
              <button className="w-full text-left text-sm text-white/60 hover:text-white/90 py-2.5 transition-colors">Change email</button>
              <button className="w-full text-left text-sm text-white/60 hover:text-white/90 py-2.5 transition-colors">Change password</button>
              <div className="border-t border-border/40 my-2" />
              <button onClick={signOut} className="w-full flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-white/50 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all">
                Sign out
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted mb-3">Sign in to sync settings across devices.</p>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-all">
                Sign in
              </Link>
            </div>
          )}
        </Card>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg shadow-accent/20"
          >
            <Check className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
