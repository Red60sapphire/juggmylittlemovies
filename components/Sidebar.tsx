"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home, Search, Compass, Film, Tv, Ghost, BookOpen, Music2,
  Trophy, Bookmark, History, Gavel, MessageCircle, PlaySquare,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Browse", href: "/trending", icon: Compass },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV Shows", href: "/tv-shows", icon: Tv },
  { label: "Anime", href: "/search?q=anime", icon: Ghost },
  { label: "Manga", href: "/search?q=manga", icon: BookOpen },
  { label: "Music", href: "/search?q=music", icon: Music2 },
  { label: "Live Sports", href: "/search?q=sports", icon: Trophy },
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "History", href: "/history", icon: History },
  { label: "Legal / DMCA", href: "/legal", icon: Gavel },
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
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
          active
            ? "text-white font-medium bg-white/5"
            : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
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
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
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
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <a
          href="https://discord.gg/pW4vjXDDJM"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
            "text-[#9CA3AF] hover:text-white hover:bg-white/5"
          )}
          title={collapsed ? "Discord" : undefined}
        >
          <MessageCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="truncate">Community</span>}
        </a>
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
