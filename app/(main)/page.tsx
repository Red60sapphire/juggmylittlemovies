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
  try {
    const trending = await getTrendingMultiPage(3);
    if (!trending?.results?.length) return null;
    return <HeroBanner movies={trending.results.slice(0, 5)} />;
  } catch { return null; }
}

async function ContinueWatchingSection() {
  try {
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
  } catch { return <ContinueWatching items={[]} />; }
}

async function StudiosContent() {
  try {
    const studioIds = getAllStudios().slice(0, 12);
    const studios = (await Promise.all(
      studioIds.map((s) => getCompany(s.id))
    )).filter((s) => s.name);
    return <StudiosSection studios={studios} />;
  } catch { return null; }
}

async function CollectionsContent() {
  try {
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
  } catch { return null; }
}

async function MovieRows() {
  try {
    const [trending, popular, topRated, trendingTV] = await Promise.all([
      getTrendingMultiPage(1).catch(() => ({ results: [] })),
      getPopularMultiPage(1).catch(() => ({ results: [] })),
      getTopRatedMultiPage(1).catch(() => ({ results: [] })),
      getTrendingTVMultiPage(1).catch(() => ({ results: [] })),
    ]);

    return (
      <>
        {trending.results.length > 0 && <HorizontalSlider title="Trending Now" items={trending.results.slice(0, 20)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />}
        {popular.results.length > 0 && <HorizontalSlider title="Popular Movies" items={popular.results.slice(0, 20)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />}
        {topRated.results.length > 0 && <HorizontalSlider title="Top Rated" items={topRated.results.slice(0, 20)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />}
        {trendingTV.results.length > 0 && <HorizontalSlider title="Popular TV Shows" items={trendingTV.results.slice(0, 20)} renderCard={(movie, i) => <MovieCard movie={movie} index={i} />} />}
      </>
    );
  } catch { return null; }
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
