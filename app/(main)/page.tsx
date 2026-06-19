export const dynamic = "force-dynamic";

import { Suspense } from "react";
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
import type { WatchHistory } from "@/types";
import {
  HeroSkeleton,
  RowSkeleton,
  CollectionSkeleton,
  StudioSkeleton,
} from "@/components/skeletons";

async function HeroSection() {
  const trending = await getTrending();
  if (!trending.results.length) return null;
  return <HeroBanner movies={trending.results.slice(0, 5)} />;
}

async function ContinueWatchingSection() {
  const supabase = await createClient();
  if (!supabase) return <ContinueWatching items={[]} />;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return <ContinueWatching items={[]} />;
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("watched_at", { ascending: false })
    .limit(10);
  return <ContinueWatching items={data || []} />;
}

async function StudiosContent() {
  const studioIds = getAllStudios().slice(0, 12);
  const studios = (await Promise.all(
    studioIds.map((s) => getCompany(s.id))
  )).filter((s) => s.name);
  return <StudiosSection studios={studios} />;
}

async function CollectionsContent() {
  const collectionIds = getAllCollections().slice(0, 10);
  const collectionsData = await Promise.all(
    collectionIds.map(async (col) => {
      const data = await getCollection(col.id);
      return {
        id: col.id,
        name: data.name,
        backdrop_path: data.backdrop_path || null,
        movies: data.parts || [],
      };
    })
  );
  return <CollectionSection collections={collectionsData.filter((c) => c.movies.length > 0)} />;
}

async function MovieRows() {
  const [trending, popular, topRated, trendingTV] = await Promise.all([
    getTrending(),
    getPopular(),
    getTopRated(),
    getTrendingTV(),
  ]);

  return (
    <>
      <MovieRow title="Trending Now" movies={trending.results.slice(0, 20)} variant="featured" />
      <MovieRow title="Popular" movies={popular.results.slice(0, 20)} />
      <MovieRow title="Top Rated" movies={topRated.results.slice(0, 20)} />
      <MovieRow title="TV Shows" movies={trendingTV.results.slice(0, 20)} />
    </>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="space-y-1 md:space-y-5">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={null}>
        <ContinueWatchingSection />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <MovieRows />
      </Suspense>

      <Suspense fallback={<StudioSkeleton />}>
        <StudiosContent />
      </Suspense>

      <div className="flex items-center gap-2 px-0.5 mb-1">
        <div className="w-1 h-4 rounded-full bg-accent" />
        <h2 className="text-base font-bold text-white tracking-tight">Collections</h2>
      </div>

      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionsContent />
      </Suspense>
    </main>
  );
}
