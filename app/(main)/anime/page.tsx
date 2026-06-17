import { getAnime } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function AnimePage() {
  const data = await getAnime();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Anime</h1>
      <MovieGrid movies={data.results} />
    </div>
  );
}
