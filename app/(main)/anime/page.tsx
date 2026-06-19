export const dynamic = "force-dynamic";

import { Suspense } from "react";
import {
  getAnime,
  getAnimeTopRated,
  getAnimeAiring,
  getAnimeMovies,
} from "@/lib/tmdb";
import type { Movie } from "@/types";

function tagAsTv(results: Movie[]): Movie[] {
  return results.map((r) => ({ ...r, media_type: "tv" as const }));
}
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import MovieGrid from "@/components/MovieGrid";
import { HeroSkeleton, RowSkeleton } from "@/components/skeletons";
import { Ghost } from "lucide-react";

async function HeroSection() {
  const data = await getAnime();
  if (!data.results.length) return null;
  return <HeroBanner movies={tagAsTv(data.results).slice(0, 5)} />;
}

async function TrendingSection() {
  const data = await getAnime();
  return <MovieRow title="Trending Anime" movies={tagAsTv(data.results).slice(0, 20)} variant="featured" />;
}

async function TopRatedSection() {
  const data = await getAnimeTopRated();
  return <MovieRow title="Top Rated" movies={tagAsTv(data.results).slice(0, 20)} />;
}

async function AiringSection() {
  const data = await getAnimeAiring();
  return <MovieRow title="Recently Aired" movies={tagAsTv(data.results).slice(0, 20)} />;
}

async function MoviesSection() {
  const data = await getAnimeMovies();
  return <MovieRow title="Anime Movies" movies={tagAsTv(data.results).slice(0, 20)} />;
}

async function AllAnimeGrid() {
  const data = await getAnime(2);
  return (
    <>
      <div className="flex items-center gap-2 px-0.5 mb-2">
        <div className="w-1 h-5 rounded-full bg-accent" />
        <h2 className="text-lg font-bold text-white tracking-tight">Browse All Anime</h2>
      </div>
      <MovieGrid movies={tagAsTv(data.results).slice(0, 24)} />
    </>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime",
  description: "Stream free anime online - trending, top rated, recently aired, and anime movies. Watch subbed and dubbed anime on Zynema.",
  openGraph: {
    title: "Anime | Zynema",
    description: "Stream free anime online - trending, top rated, recently aired, and anime movies.",
  },
};

export default function AnimePage() {
  return (
    <main id="main-content" className="space-y-8 md:space-y-5">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <div className="flex items-center gap-2 px-0.5 mb-2">
        <div className="w-1 h-5 rounded-full bg-accent" />
        <h2 className="text-lg font-bold text-white tracking-tight">Anime</h2>
        <Ghost className="w-4 h-4 text-accent/60" />
      </div>

      <Suspense fallback={<RowSkeleton />}>
        <TrendingSection />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <TopRatedSection />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <AiringSection />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <MoviesSection />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <AllAnimeGrid />
      </Suspense>
    </main>
  );
}