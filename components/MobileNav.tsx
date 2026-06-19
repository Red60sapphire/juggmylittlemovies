"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home, Search, Film, Tv, MessageCircle,
  Ghost, Bookmark, History, TrendingUp, Flame, Scale, LayoutGrid, X, Globe,
} from "lucide-react";

const mainItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "Live TV", href: "/live", icon: Tv },
  { label: "Discord", href: "https://discord.gg/pW4vjXDDJM", icon: MessageCircle, external: true },
];

const drawerItems = [
  { label: "TV Shows", href: "/tv-shows", icon: Tv },
  { label: "Anime", href: "/anime", icon: Ghost },
  { label: "Trending", href: "/trending", icon: TrendingUp },
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "History", href: "/history", icon: History },
  { label: "UFC", href: "http://ufc.solutions/", icon: Flame, external: true },
  { label: "Links", href: "/links", icon: Globe },
  { label: "Legal", href: "/legal", icon: Scale },
];

function useIsActive(href: string, external?: boolean) {
  const pathname = usePathname();
  if (external) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function MainItem({ item }: { item: typeof mainItems[0] }) {
  const active = useIsActive(item.href, item.external);
  const Icon = item.icon;

  const inner = (
    <div className="flex flex-col items-center justify-center gap-0.5 w-full h-full">
      <Icon
        className={cn(
          "w-6 h-6 transition-all",
          active && "text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
        )}
      />
      <span className={cn(
        "text-[10px] font-semibold leading-tight transition-all",
        active ? "text-white" : "text-white/50"
      )}>
        {item.label}
      </span>
    </div>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center h-full active:scale-90 transition-transform">
        {inner}
      </a>
    );
  }

  return (
    <Link href={item.href}
      className="flex-1 flex items-center justify-center h-full active:scale-90 transition-transform">
      {inner}
    </Link>
  );
}

function DrawerItem({ item, onClose }: { item: typeof drawerItems[0]; onClose: () => void }) {
  const active = useIsActive(item.href, item.external);
  const router = useRouter();
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(item.href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all",
        active
          ? "text-white bg-white/10"
          : "text-white/60 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-6 h-6", active && "text-accent")} />
      <span className="text-[11px] font-semibold">{item.label}</span>
    </button>
  );
}

export default function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="mx-3 mb-3">
          <div className="flex items-center justify-around h-14 px-1 rounded-2xl bg-black/70 backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-black/60">
            {mainItems.map((item) => (
              <MainItem key={item.href} item={item} />
            ))}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex-1 flex items-center justify-center h-full active:scale-90 transition-transform"
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <LayoutGrid className="w-6 h-6 text-white/50" />
                <span className="text-[10px] font-semibold text-white/50">More</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-t border-white/[0.06] rounded-t-3xl overflow-hidden pb-safe"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <span className="text-sm font-bold text-white">More</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
              <div className="p-5 pb-8">
                <div className="grid grid-cols-4 gap-2">
                  {drawerItems.map((item) => (
                    <DrawerItem key={item.href} item={item} onClose={() => setDrawerOpen(false)} />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
