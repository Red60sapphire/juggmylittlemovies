"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home, Search, Compass, Film, Tv, Ghost, BookOpen,
  Trophy, Bookmark, History, Gavel, MessageCircle, PlaySquare,
  TrendingUp, Scale, Flame,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Trending", href: "/trending", icon: TrendingUp },
];

const browseItems = [
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV Shows", href: "/tv-shows", icon: Tv },
  { label: "Anime", href: "/search?q=anime", icon: Ghost },
  { label: "Manga", href: "/search?q=manga", icon: BookOpen },
  { label: "Live Sports", href: "/search?q=sports", icon: Trophy },
];

const libraryItems = [
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "History", href: "/history", icon: History },
];

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

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

  return (
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
              DaMovies
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
        {browseItems.map((item) =>
          item.href === "/search?q=music" ? (
            <a
              key="ufc"
              href="http://ufc.solutions/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group text-[#9CA3AF] hover:text-white hover:bg-white/5"
              title={collapsed ? "UFC" : undefined}
            >
              <Flame className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">UFC</span>}
            </a>
          ) : (
            <NavLink key={item.href} item={item} />
          )
        )}

        <SectionLabel label="Library" />
        {libraryItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <SectionLabel label="Account" />
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
  );
}
