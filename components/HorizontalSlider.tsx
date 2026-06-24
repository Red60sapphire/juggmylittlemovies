"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props<T> {
  title: string;
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  className?: string;
  accentColor?: string;
}

const ACCENT_COLORS = ["bg-accent", "bg-accent-rose", "bg-accent-amber", "bg-accent-emerald", "bg-accent-cyan", "bg-accent-pink"];

export default function HorizontalSlider<T>({ title, items, renderCard, className = "", accentColor }: Props<T>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(":scope > *")?.clientWidth || 200;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 3;
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  };

  if (!items.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35 }}
      className={`group/slider mb-8 md:mb-6 ${className}`}
    >
      <div className="flex items-center mb-3 md:mb-2.5 px-0.5">
        <div className={`w-0.5 h-4 ${accentColor || "bg-accent"} rounded-full mr-2.5 flex-shrink-0 transition-colors`} />
        <h2 className="text-lg md:text-base font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-background via-background/90 to-transparent flex items-center pl-1 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={updateArrows}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
        >
          {items.map((item, i) => (
            <div key={i} style={{ scrollSnapAlign: "start" }} className="flex-shrink-0">
              {renderCard(item, i)}
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-background via-background/90 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
          </button>
        )}
      </div>
    </motion.section>
  );
}
