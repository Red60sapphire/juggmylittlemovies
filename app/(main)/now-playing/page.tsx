import { getNowPlaying } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function NowPlayingPage() {
  const data = await getNowPlaying();
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-accent rounded-full" />
        <h1 className="text-2xl font-bold text-white tracking-tight">Now Playing</h1>
        <span className="text-sm text-white/40">{data.results.length} titles</span>
      </div>
      <MovieGrid movies={data.results} />
    </div>
  );
}
