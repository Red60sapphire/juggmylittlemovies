import { getTrendingTV } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function TVShowsPage() {
  const data = await getTrendingTV();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">TV Shows</h1>
      <MovieGrid movies={data.results} />
    </div>
  );
}
