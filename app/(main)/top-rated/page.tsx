import { getTopRated } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Rated",
  description: "Browse the highest rated movies and TV shows of all time. Stream critically acclaimed content in HD on Zynema.",
  openGraph: {
    title: "Top Rated | Zynema",
    description: "Browse the highest rated movies and TV shows of all time.",
  },
};

export default async function TopRatedPage() {
  const data = await getTopRated();
  return (
    <main id="main-content">
      <h1 className="text-2xl font-bold text-white mb-6">Top Rated</h1>
      <MovieGrid movies={data.results} />
    </main>
  );
}
