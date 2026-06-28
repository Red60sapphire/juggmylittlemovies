"use client";

import { useState, useEffect } from "react";
import HorizontalSlider from "@/components/HorizontalSlider";
import MovieCard from "@/components/MovieCard";
import HeroCarousel from "@/components/HeroCarousel";
import type { Movie } from "@/types";
import { getImageUrl, formatRating } from "@/lib/utils";
import type { HeroItem } from "@/components/HeroCarousel";
import { TV_GENRES } from "@/lib/tmdb";
import Link from "next/link";

function toHeroItems(movies: Movie[]): HeroItem[] {
  return movies.map((m) => ({
    id: m.id,
    title: m.title || m.name || "Untitled",
    image: getImageUrl(m.backdrop_path, "original") || "",
    rating: formatRating(m.vote_average || 0),
    year: (m.first_air_date || "").split("-")[0],
    badge: "Trending",
    description: m.overview,
    href: `/watch/tv/${m.id}/1/1`,
  }));
}

function GenreRow({ genreId, genreName }: { genreId: number; genreName: string }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tmdb/genre?type=tv&id=${genreId}&all=true`)
      .then((r) => r.json())
      .then((data) => setMovies(data.results || []))
      .finally(() => setLoading(false));
  }, [genreId]);

  if (loading) return null;
  if (!movies.length) return null;

  return (
    <HorizontalSlider
      title={genreName}
      items={movies}
      renderCard={(movie, i) => <MovieCard movie={movie} index={i} />}
    />
  );
}

export default function TVShowsPage() {
  const [trending, setTrending] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/tmdb/trending?type=trending_tv&all=true")
      .then((r) => r.json())
      .then((d) => setTrending(d.results?.slice(0, 20) || []))
      .catch(() => {});
  }, []);

  const heroItems = toHeroItems(trending.slice(0, 5));

  return (
    <div className="space-y-6 animate-fade-in">
      {heroItems.length > 0 && <HeroCarousel items={heroItems} />}

      <h1 className="text-xl font-bold text-white">TV Shows</h1>

      {trending.length > 0 && (
        <HorizontalSlider
          title="Trending"
          items={trending}
          renderCard={(movie, i) => <MovieCard movie={movie} index={i} />}
        />
      )}

      <div className="space-y-4">
        {TV_GENRES.map((genre) => (
          <GenreRow key={genre.id} genreId={genre.id} genreName={genre.name} />
        ))}
      </div>

      <div className="h-px bg-border/50" />

      <section>
        <h2 className="text-base font-bold text-white mb-3">All Genres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {TV_GENRES.map((genre) => (
            <Link
              key={genre.id}
              href={`/search?genre=${genre.id}&type=tv`}
              className="block px-4 py-3 rounded-lg bg-white/[0.03] border border-border hover:border-white/30 hover:bg-white/[0.06] transition-all text-sm font-medium text-muted hover:text-white"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
