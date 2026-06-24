"use client";

import { motion } from "framer-motion";
import MovieCard from "./MovieCard";
import { GridSkeleton } from "./skeletons";
import type { Movie } from "@/types";

interface Props {
  movies: Movie[];
  loading?: boolean;
}

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MovieGrid({ movies, loading }: Props) {
  if (loading) return <GridSkeleton />;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {movies.map((movie) => (
        <motion.div key={movie.id} variants={item}>
          <MovieCard movie={movie} />
        </motion.div>
      ))}
    </motion.div>
  );
}
