"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getBackdropUrl } from "@/lib/utils";
import { Film } from "lucide-react";
import HorizontalSlider from "./HorizontalSlider";

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
  if (!collections.length) return null;

  return (
    <HorizontalSlider
      title="Collections"
      items={collections}
      renderCard={(col, i) => (
        <motion.div
          key={col.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
          style={{ scrollSnapAlign: "start" }}
        >
          <Link
            href={`/collection/${col.id}`}
            className="group block w-[290px] sm:w-[230px]"
          >
            <div className="relative h-[150px] sm:h-[110px] rounded-lg overflow-hidden bg-surface ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/30 group-hover:shadow-xl group-hover:shadow-accent/10 group-hover:-translate-y-0.5">
              {col.backdrop_path ? (
                <img
                  src={getBackdropUrl(col.backdrop_path) || ""}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-5 h-5 text-white/12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                  {col.name}
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {col.movies.length} {col.movies.length === 1 ? "movie" : "movies"}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    />
  );
}
