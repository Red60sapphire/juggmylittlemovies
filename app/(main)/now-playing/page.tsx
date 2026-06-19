import { getNowPlaying } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now Playing",
  description: "Watch movies and TV shows currently in theatres and now available to stream. New releases in HD on Zynema.",
  openGraph: {
    title: "Now Playing | Zynema",
    description: "Watch movies and TV shows currently in theatres and now available to stream.",
  },
};

export default async function NowPlayingPage() {
  const data = await getNowPlaying();
  return (
    <main id="main-content">
      <h1 className="text-2xl font-bold text-white mb-6">Now Playing</h1>
      <MovieGrid movies={data.results} />
    </main>
  );
}
