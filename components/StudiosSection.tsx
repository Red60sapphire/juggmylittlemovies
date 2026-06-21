"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import { Building2 } from "lucide-react";
import HorizontalSlider from "./HorizontalSlider";

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
    <>
      <div className="hidden md:block mb-6">
        <div className="flex items-center mb-3">
          <div className="w-0.5 h-4 bg-accent rounded-full mr-2.5 flex-shrink-0" />
          <h2 className="text-base font-bold text-white tracking-tight">Studios</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {studios.map((studio) => (
            <Link
              key={studio.id}
              href={`/studio/${studio.id}`}
              className="group relative h-[160px] rounded-xl overflow-hidden bg-white/[0.03] border border-border hover:border-accent/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {studio.logo_path ? (
                <div className="w-full h-full flex items-center justify-center p-7">
                  <img
                    src={getImageUrl(studio.logo_path, "w500")}
                    alt={studio.name}
                    className="max-w-[80%] max-h-[65%] object-contain opacity-40 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5 h-full text-white/25 group-hover:text-white/50 transition-colors">
                  <Building2 className="w-9 h-9" />
                  <span className="text-xs font-medium text-center px-4 line-clamp-2">
                    {studio.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <HorizontalSlider
          title="Studios"
          items={studios}
          renderCard={(studio, i) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
              className="w-[200px] sm:w-[150px]"
            >
              <Link href={`/studio/${studio.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface mb-1.5 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/40 group-hover:shadow-xl group-hover:shadow-accent/15 group-hover:-translate-y-1 flex items-center justify-center">
                  {studio.logo_path ? (
                    <img
                      src={getImageUrl(studio.logo_path, "w500")}
                      alt={studio.name}
                      className="w-[75%] h-[75%] object-contain opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-200"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-white/20" />
                  )}
                </div>
                <h3 className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate px-0.5">
                  {studio.name}
                </h3>
              </Link>
            </motion.div>
          )}
        />
      </div>
    </>
  );
}
