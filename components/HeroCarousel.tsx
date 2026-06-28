"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info } from "lucide-react";
import Link from "next/link";

export interface HeroItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image: string;
  fallbackGradient?: string;
  rating?: number | string;
  year?: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  href: string;
  mediaType?: string;
}

interface HeroCarouselProps {
  items: HeroItem[];
  interval?: number;
  maxSlides?: number;
  heightClass?: string;
  minHeight?: string;
}

export default function HeroCarousel({
  items,
  interval = 7000,
  maxSlides = 5,
  heightClass = "h-[60vh] min-h-[480px] md:h-[55vh] md:max-h-[650px]",
  minHeight,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);
  const visibleItems = items.slice(0, maxSlides);

  const goTo = useCallback((i: number) => {
    if (i === current) return;
    setPrev(current);
    setCurrent(i);
  }, [current]);

  useEffect(() => {
    if (isPaused || visibleItems.length < 2) return;
    timerRef.current = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c + 1) % visibleItems.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [current, isPaused, visibleItems.length, interval]);

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 500);
    return () => clearTimeout(t);
  }, [prev]);

  if (!items.length) return null;
  const item = visibleItems[current];
  const prevItem = prev !== null ? visibleItems[prev] : null;

  return (
    <section
      className={`relative w-full overflow-hidden rounded-none md:rounded-2xl mb-8 md:mb-6 shadow-2xl shadow-black/30 ${heightClass}`}
      style={minHeight ? { minHeight } : undefined}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Crossfade layers */}
      {prevItem && (
        <div
          key={`prev-${prevItem.id}`}
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{ opacity: prev !== null ? 0 : 1, zIndex: 0 }}
        >
          <img src={prevItem.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img src={item.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id + "-content"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-10"
        >
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-2 mb-3 flex-wrap"
            >
              {item.badge && (
                <span className="px-2.5 py-0.5 bg-accent/90 text-white text-[10px] font-bold rounded-full tracking-wider uppercase shadow-lg shadow-accent/20">
                  {item.badge}
                </span>
              )}
              {item.rating && (
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                  <svg className="w-3 h-3 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  {item.rating}
                </div>
              )}
              {item.year && <span className="text-white/40 text-xs">{item.year}</span>}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-2xl"
            >
              {item.title}
            </motion.h1>

            {item.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-white/50 text-sm line-clamp-2 mb-4 max-w-xl"
              >
                {item.description}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <Link
                href={item.href}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" /> Watch Now
              </Link>
              <Link
                href={item.href}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
              >
                <Info className="w-4 h-4" /> Details
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 flex gap-2 z-10">
        {visibleItems.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-500 active:scale-90 ${
              i === current ? "w-8 bg-accent shadow-lg shadow-accent/40" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
