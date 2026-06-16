import { getTrending } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function TrendingPage() {
  const data = await getTrending();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Trending</h1>
      <MovieGrid movies={data.results} />
    </div>
  );
}
