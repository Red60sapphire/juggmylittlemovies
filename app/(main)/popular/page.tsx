import { getPopular } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function PopularPage() {
  const data = await getPopular();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Popular</h1>
      <MovieGrid movies={data.results} />
    </div>
  );
}
