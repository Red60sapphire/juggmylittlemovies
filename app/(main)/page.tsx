import {
  getTrending,
  getPopular,
  getTopRated,
  getTrendingTV,
  getCollection,
  getCompany,
  getAllStudios,
  getAllCollections,
} from "@/lib/tmdb";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import StudiosSection from "@/components/StudiosSection";
import CollectionSection from "@/components/CollectionSection";
import ContinueWatching from "@/components/ContinueWatching";
import { createClient } from "@/lib/supabase/server";
import type { WatchHistory, Movie } from "@/types";

export default async function HomePage() {
  const [trending, popular, topRated, trendingTV] = await Promise.all([
    getTrending(),
    getPopular(),
    getTopRated(),
    getTrendingTV(),
  ]);

  const hasContent = trending.results.length > 0;

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

  let studios: { id: number; name: string; logo_path: string | null }[] = [];
  let collectionCards: { name: string; backdrop_path: string | null; movies: Movie[] }[] = [];

  if (hasContent) {
    const studioIds = getAllStudios().slice(0, 4);
    studios = (await Promise.all(
      studioIds.map((s) => getCompany(s.id))
    )).filter((s) => s.name);

    const collectionIds = getAllCollections().slice(0, 5);
    const collectionsData = await Promise.all(
      collectionIds.map((c) => getCollection(c.id))
    );
    collectionCards = collectionsData
      .filter((c) => c.parts?.length > 0)
      .map((c) => ({
        name: c.name,
        backdrop_path: c.backdrop_path || null,
        movies: c.parts as Movie[],
      }));
  }

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Setup Required</h1>
          <p className="text-white/60 mb-6">
            Add your API keys to see movies and TV shows.
          </p>
          <div className="bg-white/5 rounded-xl p-4 text-left text-sm text-white/70 space-y-2">
            <p><span className="text-purple-400 font-medium">1.</span> Get a TMDB API key at themoviedb.org</p>
            <p><span className="text-purple-400 font-medium">2.</span> Create a Supabase project at supabase.com</p>
            <p><span className="text-purple-400 font-medium">3.</span> Run <code className="bg-white/10 px-1 rounded">supabase-schema.sql</code> in Supabase SQL Editor</p>
            <p><span className="text-purple-400 font-medium">4.</span> Set these env vars in Vercel:</p>
            <pre className="bg-black/30 p-2 rounded-lg text-xs mt-1">
TMDB_ACCESS_TOKEN=your_tmdb_token{'\n'}
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url{'\n'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroBanner movies={trending.results.slice(0, 5)} />
      <ContinueWatching items={continueWatching} />
      <StudiosSection studios={studios} />
      <CollectionSection collections={collectionCards} />
      <MovieRow title="Trending Now" movies={trending.results} />
      <MovieRow title="Popular Movies" movies={popular.results} />
      <MovieRow title="Top Rated" movies={topRated.results} />
      <MovieRow title="Popular TV Shows" movies={trendingTV.results} />
    </div>
  );
}
