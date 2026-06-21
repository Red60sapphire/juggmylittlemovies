import { getTopRatedMultiPage } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function TopRatedPage() {
  const data = await getTopRatedMultiPage(5);
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-0.5 h-5 bg-accent rounded-full" />
        <h1 className="text-xl font-bold text-white tracking-tight">Top Rated</h1>
        <span className="text-xs text-muted ml-1">{data.results.length} titles</span>
      </div>
      <MovieGrid movies={data.results} />
    </div>
  );
}
