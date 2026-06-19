import { getPopular } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular",
  description: "Watch the most popular movies and TV shows right now. Stream trending content in HD on Zynema.",
  openGraph: {
    title: "Popular | Zynema",
    description: "Watch the most popular movies and TV shows right now.",
  },
};

export default async function PopularPage() {
  const data = await getPopular();
  return (
    <main id="main-content">
      <h1 className="text-2xl font-bold text-white mb-6">Popular</h1>
      <MovieGrid movies={data.results} />
    </main>
  );
}
