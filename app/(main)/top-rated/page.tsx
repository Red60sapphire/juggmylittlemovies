import { getTopRated } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function TopRatedPage() {
  const data = await getTopRated();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Top Rated</h1>
      <MovieGrid movies={data.results} />
    </div>
  );
}
