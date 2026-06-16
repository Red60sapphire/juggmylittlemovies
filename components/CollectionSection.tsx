"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { getBackdropUrl } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";

interface CollectionData {
  id: number;
  name: string;
  backdrop_path?: string | null;
  movies: { id: number; title?: string; poster_path: string | null }[];
}

interface Props {
  collections: CollectionData[];
}

export default function CollectionSection({ collections }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) { el.addEventListener("scroll", checkScroll); checkScroll(); }
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [collections]);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.6;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!collections.length) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-base font-bold text-white tracking-tight">Collections</h2>
        <div className="flex gap-1.5">
          <button onClick={() => scroll("left")} className={`p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 transition-all ${showLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <ChevronLeft className="w-3.5 h-3.5 text-white" />
          </button>
          <button onClick={() => scroll("right")} className={`p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 transition-all ${showRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-3 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collection/${col.id}`}
            className="group flex-shrink-0 w-[260px] sm:w-[240px] snap-start relative h-[130px] sm:h-[120px] rounded-xl overflow-hidden bg-[#171717] border border-[#2A2A2A] hover:border-accent/40 transition-all duration-200"
          >
            {col.backdrop_path ? (
              <img
                src={getBackdropUrl(col.backdrop_path) || ""}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#171717]">
                <Film className="w-6 h-6 text-white/15" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                {col.name}
              </h3>
              <span className="text-[11px] text-white/50 mt-0.5 block">
                {col.movies.length} {col.movies.length === 1 ? "movie" : "movies"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
