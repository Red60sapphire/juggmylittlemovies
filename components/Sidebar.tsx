"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home, Search, Film, Tv, Ghost,
  Trophy, Bookmark, History, MessageCircle, PlaySquare,
  TrendingUp, Scale, Flame, Users, Settings, LogIn, UserPlus,
  Mail, Copy, Check, X,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Trending", href: "/trending", icon: TrendingUp },
];

const browseItems = [
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV Shows", href: "/tv-shows", icon: Tv },
  { label: "Anime", href: "/anime", icon: Ghost },
  { label: "Live Sports", href: "/search?q=sports", icon: Trophy },
];

const libraryItems = [
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "History", href: "/history", icon: History },
  { label: "Watch Party", href: "/watch-party", icon: Users },
];

const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV", href: "/tv-shows", icon: Tv },
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

  const NavLink = ({ item }: { item: { label: string; href: string; icon: any } }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
          active
            ? "text-white font-medium"
            : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
        )}
        title={collapsed ? item.label : undefined}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
        )}
        <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-accent")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => {
    if (collapsed) return null;
    return (
      <p className="px-3 text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-2 mt-6">
        {label}
      </p>
    );
  };

  // Mobile bottom navigation bar
  if (mobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[72px] bg-[#111111] border-t border-[#2A2A2A] flex items-center justify-evenly px-2 pb-safe">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg transition-all min-w-0 flex-1 max-w-[80px]",
                active ? "text-accent" : "text-[#555] hover:text-white"
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

  // Desktop sidebar
  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-[#111111] border-r border-[#2A2A2A] transition-all duration-300 flex flex-col",
          collapsed ? "w-[80px]" : "w-[240px]"
        )}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[#2A2A2A] flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/20">
              <PlaySquare className="w-4 h-4 text-white" />
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
              "text-[#9CA3AF] hover:text-white hover:bg-white/5"
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

          <SectionLabel label="Account" />
          <Link
            href="/settings"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              pathname === "/settings"
                ? "text-white font-medium"
                : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            {pathname === "/settings" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
            )}
            <Settings className={cn("w-5 h-5 flex-shrink-0", pathname === "/settings" && "text-accent")} />
            {!collapsed && <span className="truncate">Settings</span>}
          </Link>
          <Link
            href="/login"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              pathname === "/login"
                ? "text-white font-medium"
                : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
            )}
            title={collapsed ? "Login" : undefined}
          >
            {pathname === "/login" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
            )}
            <LogIn className={cn("w-5 h-5 flex-shrink-0", pathname === "/login" && "text-accent")} />
            {!collapsed && <span className="truncate">Login</span>}
          </Link>
          <Link
            href="/signup"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              pathname === "/signup"
                ? "text-white font-medium"
                : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
            )}
            title={collapsed ? "Signup" : undefined}
          >
            {pathname === "/signup" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
            )}
            <UserPlus className={cn("w-5 h-5 flex-shrink-0", pathname === "/signup" && "text-accent")} />
            {!collapsed && <span className="truncate">Signup</span>}
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
          <a
            href="https://discord.gg/pW4vjXDDJM"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              "text-[#9CA3AF] hover:text-white hover:bg-white/5"
            )}
            title={collapsed ? "Discord" : undefined}
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Discord</span>}
          </a>
          <Link
            href="/legal"
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              pathname === "/legal"
                ? "text-white font-medium"
                : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
            )}
            title={collapsed ? "Legal / DMCA" : undefined}
          >
            {pathname === "/legal" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
            )}
            <Scale className={cn("w-5 h-5 flex-shrink-0", pathname === "/legal" && "text-accent")} />
            {!collapsed && <span className="truncate">Legal / DMCA</span>}
          </Link>
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
