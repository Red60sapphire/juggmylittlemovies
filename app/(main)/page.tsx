export const dynamic = "force-dynamic";

import { Suspense } from "react";
import {
  getTrending,
  getTrendingMultiPage,
  getPopular,
  getPopularMultiPage,
  getTopRated,
  getTopRatedMultiPage,
  getTrendingTV,
  getTrendingTVMultiPage,
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
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import type { WatchHistory, Movie } from "@/types";
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
  const session = await getSession();
  if (!session) return <ContinueWatching items={[]} />;
  const supabase = createAdminClient();
  if (!supabase) return <ContinueWatching items={[]} />;
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", session.userId)
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
    getTrendingMultiPage(3),
    getPopularMultiPage(3),
    getTopRatedMultiPage(3),
    getTrendingTVMultiPage(3),
  ]);

  return (
    <>
      <MovieRow title="Trending Now" movies={trending.results.slice(0, 40)} />
      <MovieRow title="Popular Movies" movies={popular.results.slice(0, 40)} />
      <MovieRow title="Top Rated" movies={topRated.results.slice(0, 40)} />
      <MovieRow title="Popular TV Shows" movies={trendingTV.results.slice(0, 40)} />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8 md:space-y-5">
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
      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionsContent />
      </Suspense>
    </div>
  );
}
