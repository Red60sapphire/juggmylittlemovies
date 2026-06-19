"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/search": "Search",
  "/trending": "Trending",
  "/movies": "Movies",
  "/tv-shows": "TV Shows",
  "/anime": "Anime",
  "/live": "Live TV",
  "/watchlist": "Watchlist",
  "/history": "History",
  "/popular": "Popular",
  "/top-rated": "Top Rated",
  "/now-playing": "Now Playing",
  "/continue-watching": "Continue Watching",
};

const backFallback: Record<string, string> = {
  "watch": "/",
  "movie": "/movies",
  "live": "/live",
  "collection": "/",
  "studio": "/",
};

export default function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const isSubPage =
    pathname.split("/").filter(Boolean).length > 1 &&
    !pageTitles[pathname];

  const currentTitle =
    pageTitles[pathname] ||
    pageTitles[pathname.replace(/\/[^/]+$/, "")] ||
    "Zynema";

  const root = pathname.split("/").filter(Boolean)[0] || "";
  const backHref = backFallback[root] || "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isSubPage ? (
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push(backHref);
              }
            }}
            className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 shadow-lg shadow-purple-600/20">
              <img src="/icon.png" alt="Zynema" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">Zynema</span>
          </div>
        )}
        {isSubPage && (
          <span className="font-semibold text-sm text-white truncate">
            {currentTitle}
          </span>
        )}
      </div>

      <Link
        href="/search"
        className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
      >
        <Search className="w-4 h-4 text-white/70" />
      </Link>
    </header>
  );
}