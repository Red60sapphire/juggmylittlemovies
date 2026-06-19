"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home, Search, Film, Tv, Ghost,
  Bookmark, History, MessageCircle,
  TrendingUp, Scale, Flame, LayoutGrid, Globe,
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
  { label: "Live", href: "/live", icon: Tv },
];

const libraryItems = [
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "History", href: "/history", icon: History },
];

const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "TV", href: "/tv-shows", icon: Tv },
];

const moreMenuItems = [
  { section: "Discover", items: browseItems.slice(2) },
  { section: "Browse", items: [navItems[2]] },
  { section: "Library", items: libraryItems },
  { section: "Links", items: [
    { label: "UFC", href: "http://ufc.solutions/", icon: Flame, external: true },
    { label: "Discord", href: "https://discord.gg/pW4vjXDDJM", icon: MessageCircle, external: true },
    { label: "Legal / DMCA", href: "/legal", icon: Scale },
  ]},
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export default function Sidebar({ collapsed, onToggle, mobile }: Props) {
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

  // Mobile bottom navigation bar
  const [showMore, setShowMore] = useState(false);

  if (mobile) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2A2A2A] pb-safe">
          <div className="flex items-center justify-evenly h-[64px] px-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all",
                    active ? "text-white" : "text-[#555] hover:text-white"
                  )}
                >
                  <Icon className={cn("w-6 h-6", active && "text-accent")} />
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all text-[#555] hover:text-white"
            >
              <LayoutGrid className="w-6 h-6" />
              <span className="text-[10px] font-semibold">More</span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {showMore && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowMore(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2A2A2A] rounded-t-2xl max-h-[70vh] overflow-y-auto pb-safe"
              >
                <div className="sticky top-0 bg-[#111111] z-10 flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
                  <span className="font-bold text-white text-sm">Navigation</span>
                  <button
                    onClick={() => setShowMore(false)}
                    className="px-3 py-1.5 text-xs text-[#9CA3AF] hover:text-white bg-[#1B1B1B] rounded-lg border border-[#2A2A2A] transition-all"
                  >
                    Done
                  </button>
                </div>
                <div className="p-5 space-y-6">
                  {moreMenuItems.map((group) => (
                    <div key={group.section}>
                      <p className="text-[11px] font-semibold text-[#555] uppercase tracking-widest mb-3">
                        {group.section}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {group.items.map((item: any) => {
                          const Icon = item.icon;
                          const active = isActive(item.href);
                          const Comp = item.external ? "a" : Link;
                          const props = item.external
                            ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                            : { href: item.href };
                          return (
                            <Comp
                              key={item.href}
                              {...props}
                              onClick={() => setShowMore(false)}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl transition-all",
                                active
                                  ? "text-white bg-white/10"
                                  : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                              )}
                            >
                              <Icon className={cn("w-5 h-5", active && "text-accent")} />
                              <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                            </Comp>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-[#111111] border-r border-[#2A2A2A] transition-all duration-300 flex flex-col",
        collapsed ? "w-[80px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#2A2A2A] flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-purple-600/20">
            <img src="/icon.png" alt="Zynema" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-white whitespace-nowrap tracking-tight">
              Zynema
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

        <SectionLabel label="Info" />
        <Link
          href="/links"
          className={cn(
            "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
            pathname === "/links"
              ? "text-white font-medium"
              : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
          )}
          title={collapsed ? "Links" : undefined}
        >
          {pathname === "/links" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />
          )}
          <Globe className={cn("w-5 h-5 flex-shrink-0", pathname === "/links" && "text-accent")} />
          {!collapsed && <span className="truncate">Links</span>}
        </Link>
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
