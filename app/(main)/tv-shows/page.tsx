import { Suspense } from "react";
import { getTVByGenre } from "@/lib/tmdb";
import MovieRow from "@/components/MovieRow";
import { RowSkeleton } from "@/components/skeletons";

const GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

async function GenreRow({ genre }: { genre: { id: number; name: string } }) {
  const data = await getTVByGenre(genre.id);
  if (!data.results?.length) return null;
  return <MovieRow title={genre.name} movies={data.results.slice(0, 20)} />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows",
  description: "Browse TV shows by genre - Drama, Comedy, Sci-Fi, Animation, and more. Stream free HD TV shows on Zynema.",
  openGraph: {
    title: "TV Shows | Zynema",
    description: "Browse TV shows by genre - Drama, Comedy, Sci-Fi, Animation, and more.",
  },
};

export default function TVShowsPage() {
  return (
    <main id="main-content" className="space-y-4">
      <h1 className="text-2xl font-bold text-white px-0.5">TV Shows</h1>
      {GENRES.map((genre) => (
        <Suspense key={genre.id} fallback={<RowSkeleton />}>
          <GenreRow genre={genre} />
        </Suspense>
      ))}
    </main>
  );
}
