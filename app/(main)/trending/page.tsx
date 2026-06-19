import { getTrending } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending",
  description: "Watch trending movies and TV shows. Stream the most popular content on Zynema in HD.",
  openGraph: {
    title: "Trending | Zynema",
    description: "Watch trending movies and TV shows.",
  },
};

export default async function TrendingPage() {
  const data = await getTrending();
  return (
    <main id="main-content">
      <h1 className="text-2xl font-bold text-white mb-6">Trending</h1>
      <MovieGrid movies={data.results} />
    </main>
  );
}
