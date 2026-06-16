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
  const studioIds = getAllStudios().slice(0, 4);
  const studios = (await Promise.all(
    studioIds.map((s) => getCompany(s.id))
  )).filter((s) => s.name);
  return <StudiosSection studios={studios} />;
}

async function CollectionsContent() {
  const collectionIds = getAllCollections().slice(0, 5);
  const collectionsData = await Promise.all(
    collectionIds.map((c) => getCollection(c.id))
  );
  const cards = collectionsData
    .filter((c) => c.parts?.length > 0)
    .map((c) => ({
      name: c.name,
      backdrop_path: c.backdrop_path || null,
      movies: c.parts as Movie[],
    }));
  return <CollectionSection collections={cards} />;
}

async function MovieRows() {
  const [popular, topRated, trendingTV] = await Promise.all([
    getPopular(),
    getTopRated(),
    getTrendingTV(),
  ]);

  return (
    <>
      <MovieRow title="Popular Movies" movies={popular.results} />
      <MovieRow title="Top Rated" movies={topRated.results} />
      <MovieRow title="Popular TV Shows" movies={trendingTV.results} />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6">
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
