import { getDiscover } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function MoviesPage() {
  const data = await getDiscover();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Movies</h1>
      <MovieGrid movies={data.results} />
    </div>
  );
}
