import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  getTrendingTV,
} from "@/lib/tmdb";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import ContinueWatching from "@/components/ContinueWatching";
import { createClient } from "@/lib/supabase/server";
import type { WatchHistory, Movie } from "@/types";

export default async function HomePage() {
  const [trending, popular, topRated, nowPlaying, upcoming, trendingTV] =
    await Promise.all([
      getTrending(),
      getPopular(),
      getTopRated(),
      getNowPlaying(),
      getUpcoming(),
      getTrendingTV(),
    ]);

  let continueWatching: WatchHistory[] = [];
  const supabase = await createClient();
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data } = await supabase
        .from("watch_history")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("watched_at", { ascending: false })
        .limit(10);
      if (data) continueWatching = data;
    }
  }

  return (
    <div className="space-y-6">
      <HeroBanner movies={trending.results.slice(0, 5)} />
      <ContinueWatching items={continueWatching} />
      <MovieRow title="Trending Now" movies={trending.results} />
      <MovieRow title="Popular Movies" movies={popular.results} />
      <MovieRow title="Top Rated" movies={topRated.results} />
      <MovieRow title="Now Playing" movies={nowPlaying.results} />
      <MovieRow title="Upcoming" movies={upcoming.results} />
      <MovieRow title="Popular TV Shows" movies={trendingTV.results} />
    </div>
  );
}
