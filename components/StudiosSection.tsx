"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface Studio {
  id: number;
  name: string;
  logo_path: string | null;
}

interface Props {
  studios: Studio[];
}

export default function StudiosSection({ studios }: Props) {
  if (!studios.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-8 md:mb-6"
    >
      {/* Mobile: horizontal scroll row matching movie card dimensions */}
      <div className="md:hidden">
        <h2 className="text-xl font-bold text-white tracking-tight mb-4">Studios</h2>
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {studios.map((studio, i) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="flex-shrink-0 w-[220px] snap-start"
            >
              <Link href={`/studio/${studio.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#e5e5e5] mb-1.5 shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 flex items-center justify-center">
                  {studio.logo_path ? (
                    <img
                      src={getImageUrl(studio.logo_path, "w500")}
                      alt={studio.name}
                      className="w-[75%] h-[75%] object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-[#999]" />
                  )}
                </div>
                <h3 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate px-0.5">
                  {studio.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desktop: grid layout */}
      <div className="hidden md:block">
        <h2 className="text-base font-bold text-white mb-4">Studios</h2>
        <div className="grid grid-cols-4 gap-4">
          {studios.map((studio) => (
            <Link
              key={studio.id}
              href={`/studio/${studio.id}`}
              className="group relative h-[170px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-accent/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {studio.logo_path ? (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <img
                    src={getImageUrl(studio.logo_path, "w500")}
                    alt={studio.name}
                    className="max-w-[80%] max-h-[65%] object-contain opacity-50 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 h-full text-white/30 group-hover:text-white/60 transition-colors">
                  <Building2 className="w-10 h-10" />
                  <span className="text-sm font-medium text-center px-4 line-clamp-2">
                    {studio.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
