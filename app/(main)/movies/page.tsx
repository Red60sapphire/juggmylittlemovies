import { Suspense } from "react";
import { getMoviesByGenre } from "@/lib/tmdb";
import MovieRow from "@/components/MovieRow";
import { RowSkeleton } from "@/components/skeletons";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

async function GenreRow({ genre }: { genre: { id: number; name: string } }) {
  const data = await getMoviesByGenre(genre.id);
  if (!data.results?.length) return null;
  return <MovieRow title={genre.name} movies={data.results.slice(0, 20)} />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse movies by genre - Action, Comedy, Drama, Horror, Sci-Fi, and more. Stream free HD movies on Zynema.",
  openGraph: {
    title: "Movies | Zynema",
    description: "Browse movies by genre - Action, Comedy, Drama, Horror, Sci-Fi, and more.",
  },
};

export default function MoviesPage() {
  return (
    <main id="main-content" className="space-y-4">
      <h1 className="text-2xl font-bold text-white px-0.5">Movies</h1>
      {GENRES.map((genre) => (
        <Suspense key={genre.id} fallback={<RowSkeleton />}>
          <GenreRow genre={genre} />
        </Suspense>
      ))}
    </main>
  );
}
