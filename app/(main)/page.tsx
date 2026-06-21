export const dynamic = "force-dynamic";

import { Suspense } from "react";
import {
  getTrendingMultiPage,
  getPopularMultiPage,
  getTopRatedMultiPage,
  getTrendingTVMultiPage,
  getCollection,
  getCompany,
  getAllStudios,
  getAllCollections,
} from "@/lib/tmdb";
import HeroBanner from "@/components/HeroBanner";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
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
  const trending = await getTrendingMultiPage(3);
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
      <HorizontalSlider title="Trending Now" items={trending.results.slice(0, 40)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />
      <HorizontalSlider title="Popular Movies" items={popular.results.slice(0, 40)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />
      <HorizontalSlider title="Top Rated" items={topRated.results.slice(0, 40)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />
      <HorizontalSlider title="Popular TV Shows" items={trendingTV.results.slice(0, 40)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-1 md:space-y-0">
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
