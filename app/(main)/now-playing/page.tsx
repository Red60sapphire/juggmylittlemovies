import { getNowPlaying } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function NowPlayingPage() {
  const data = await getNowPlaying();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Now Playing</h1>
      <MovieGrid movies={data.results} />
    </div>
  );
}
