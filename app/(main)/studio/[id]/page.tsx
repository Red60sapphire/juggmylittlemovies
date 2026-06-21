"use client";

import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [company, setCompany] = useState<any>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [displayCount, setDisplayCount] = useState(40);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const companyId = parseInt(id);
    setLoading(true);
    Promise.all([
      fetch(`/api/tmdb/company/${companyId}`).then((r) => r.json()),
      fetch(`/api/tmdb/company/${companyId}/movies?all=true`).then((r) => r.json()),
    ]).then(([companyData, moviesData]) => {
      setCompany(companyData);
      setAllMovies(moviesData.results || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white/50">Company not found</p>
      </div>
    );
  }

  const displayed = allMovies.slice(0, displayCount);
  const hasMore = displayCount < allMovies.length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        {company.logo_path ? (
          <img
            src={getImageUrl(company.logo_path, "w500")}
            alt={company.name}
            className="h-10 object-contain"
          />
        ) : (
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
          </div>
        )}
        <span className="text-white/40 text-sm">{allMovies.length} movies</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayed.map((movie, i) => (
          <MovieCard key={movie.id} movie={movie} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setDisplayCount((c) => c + 40)}
            className="px-8 py-3 bg-white/5 hover:bg-accent text-white text-sm font-semibold rounded-xl border border-white/10 hover:border-accent/50 transition-all"
          >
            Load More ({allMovies.length - displayCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
