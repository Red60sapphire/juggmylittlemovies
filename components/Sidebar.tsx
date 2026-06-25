"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home, Search, Film, Tv, Ghost, BookOpen,
  Trophy, Bookmark, History, MessageCircle,
  TrendingUp, Scale, Flame, Users, Settings, LogIn, UserPlus,
  Mail, Copy, Check, X,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home, glow: "group-hover:text-[#8B5CF6]" },
  { label: "Search", href: "/search", icon: Search, glow: "group-hover:text-[#06B6D4]" },
  { label: "Trending", href: "/trending", icon: TrendingUp, glow: "group-hover:text-[#F43F5E]" },
];

const browseItems = [
  { label: "Movies", href: "/movies", icon: Film, glow: "group-hover:text-[#3B82F6]" },
  { label: "TV Shows", href: "/tv-shows", icon: Tv, glow: "group-hover:text-[#8B5CF6]" },
  { label: "Anime", href: "/anime", icon: Ghost, glow: "group-hover:text-[#EC4899]" },
  { label: "Manga", href: "/manga", icon: BookOpen, glow: "group-hover:text-[#10B981]" },
  { label: "Live Sports", href: "/live-sports", icon: Trophy, glow: "group-hover:text-[#F59E0B]" },
];

const libraryItems = [
  { label: "Watchlist", href: "/watchlist", icon: Bookmark, glow: "group-hover:text-[#8B5CF6]" },
  { label: "History", href: "/history", icon: History, glow: "group-hover:text-[#06B6D4]" },
  { label: "Watch Party", href: "/watch-party", icon: Users, glow: "group-hover:text-[#10B981]" },
];

const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV", href: "/tv-shows", icon: Tv },
  { label: "Anime", href: "/anime", icon: Ghost },
  { label: "Manga", href: "/manga", icon: BookOpen },
  { label: "Watch Party", href: "/watch-party", icon: Users },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export default function Sidebar({ collapsed, onToggle, mobile }: Props) {
  const pathname = usePathname();
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("osamabinoven@juggmylittlemovies.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: { label: string; href: string; icon: any; glow?: string } }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
          active
            ? "text-white font-medium"
            : "text-muted hover:text-white hover:bg-white/[0.04]"
        )}
        title={collapsed ? item.label : undefined}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-accent to-accent/50" />
        )}
        <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", active ? "text-accent" : item.glow)} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => {
    if (collapsed) return null;
    return (
      <p className="px-3 text-[11px] font-semibold text-subtle uppercase tracking-widest mb-2 mt-6">
        {label}
      </p>
    );
  };

  if (mobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[72px] bg-sidebar border-t border-border flex items-center justify-evenly px-2 pb-safe">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg transition-all min-w-0 flex-1 max-w-[80px]",
                active ? "text-accent" : "text-subtle hover:text-white"
              )}
            >
              <Icon className={cn("w-7 h-7", active && "text-accent")} />
              <span className="text-[11px] font-semibold truncate max-w-full leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-sidebar border-r border-border transition-all duration-300 flex flex-col",
          collapsed ? "w-[80px]" : "w-[240px]"
        )}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
              <img src="/icon.png" alt="juggmylittlemovies" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-white whitespace-nowrap tracking-tight">
                juggmylittlemovies
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-hide">
          <SectionLabel label="Browse" />
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          <SectionLabel label="Discover" />
          {browseItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          <a
            href="http://ufc.solutions/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              "text-muted hover:text-white hover:bg-white/[0.04]"
            )}
            title={collapsed ? "UFC" : undefined}
          >
            <Flame className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">UFC</span>}
          </a>

          <SectionLabel label="Library" />
          {libraryItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          <div className="mx-3 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <SectionLabel label="Account" />
          <Link
            href="/settings"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              pathname === "/settings"
                ? "text-white font-medium"
                : "text-muted hover:text-white hover:bg-white/[0.04]"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            {pathname === "/settings" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
            )}
            <Settings className={cn("w-5 h-5 flex-shrink-0", pathname === "/settings" && "text-accent")} />
            {!collapsed && <span className="truncate">Settings</span>}
          </Link>
          <button
            onClick={() => setContactOpen(true)}
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group w-full text-left",
              "text-[#9CA3AF] hover:text-white hover:bg-white/5"
            )}
            title={collapsed ? "Contact us" : undefined}
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Contact us</span>}
          </button>
          <Link
            href="/legal"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              pathname === "/legal"
                ? "text-white font-medium"
                : "text-muted hover:text-white hover:bg-white/[0.04]"
            )}
            title={collapsed ? "Legal / DMCA" : undefined}
          >
            {pathname === "/legal" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
            )}
            <Scale className={cn("w-5 h-5 flex-shrink-0", pathname === "/legal" && "text-accent")} />
            {!collapsed && <span className="truncate">Legal / DMCA</span>}
          </Link>

          {/* Auth Section */}
          <div className={cn(
            "mx-2 mt-6 rounded-xl overflow-hidden",
            collapsed ? "px-0" : "p-3",
            "bg-white/[0.03] border border-white/[0.06]"
          )}>
            {!collapsed && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-accent" />
                  <span className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">Join</span>
                </div>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-white/50 hover:text-white mb-1.5"
                >
                  <LogIn className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Log in</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/60"
                >
                  <UserPlus className="w-5 h-5 flex-shrink-0" />
                  <span>Sign up</span>
                </Link>
              </>
            )}
            {collapsed && (
              <div className="flex flex-col items-center gap-1 py-2">
                <Link
                  href="/login"
                  className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-all"
                  title="Login"
                >
                  <LogIn className="w-5 h-5" />
                </Link>
                <Link
                  href="/signup"
                  className="p-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-all"
                  title="Signup"
                >
                  <UserPlus className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </nav>

        <button
          onClick={onToggle}
          className="flex items-center justify-center h-12 border-t border-[#2A2A2A] text-[#9CA3AF] hover:text-white transition-colors flex-shrink-0"
        >
          <svg
            className={cn("w-5 h-5 transition-transform duration-300", collapsed && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"}
            />
          </svg>
        </button>
      </aside>

      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setContactOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#141419] p-6 shadow-2xl">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute right-4 top-4 text-[#9CA3AF] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Contact us</h2>
            <p className="text-sm text-white/50 mb-6">We'd love to hear from you.</p>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-xs text-white/40 mb-2">Email</p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-white break-all">osamabinoven@juggmylittlemovies.com</span>
                  <button
                    onClick={copyEmail}
                    className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
                  </button>
                </div>
              </div>
              <a
                href="https://discord.gg/pW4vjXDDJM"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 hover:bg-white/[0.08] transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-[#5865F2]" />
                <span className="text-sm font-semibold text-white">Join our Discord</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
