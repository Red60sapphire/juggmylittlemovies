import { getMovieDetails } from "@/lib/tmdb";
import { getImageUrl, getBackdropUrl, formatRating, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Play, Star, Clock, Calendar, ChevronRight } from "lucide-react";
import type { CastMember, Trailer } from "@/types";

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovieDetails(parseInt(id));

  const cast: CastMember[] = (movie as any)?.credits?.cast?.slice(0, 12) || [];
  const trailers: Trailer[] = ((movie as any)?.videos?.results || []).filter(
    (v: Trailer) => v.site === "YouTube" && v.type === "Trailer"
  ).slice(0, 4);
  const year = movie?.release_date?.split("-")[0] || "";
  const runtime = movie?.runtime || 0;

  return (
    <div className="animate-fade-in">
      {/* Backdrop Hero */}
      <div className="relative h-[55vh] min-h-[400px] rounded-2xl overflow-hidden mb-8">
        <img src={getBackdropUrl(movie.backdrop_path) || ""} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-[#0a0a0f]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-48 mb-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster */}
          <div className="w-[200px] flex-shrink-0 hidden md:block">
            <div className="rounded-xl overflow-hidden ring-1 ring-white/[0.08] shadow-2xl shadow-black/50">
              <img src={getImageUrl(movie.poster_path, "w342")} alt={movie.title} className="w-full" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              {year && <span className="text-sm font-medium text-accent">{year}</span>}
              {runtime > 0 && (
                <span className="text-sm text-white/40">
                  {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
              {movie.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-white/60 mb-4 flex-wrap">
              {movie.vote_average ? (
                <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
              ) : null}
              {movie.release_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(movie.release_date)}
                </span>
              )}
              {movie.genres?.map((g: { id: number; name: string }) => (
                <span key={g.id} className="px-2.5 py-0.5 bg-white/[0.06] rounded-full text-xs font-medium text-white/70">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-white/60 leading-relaxed mb-6 max-w-2xl text-sm md:text-base">
              {movie.overview}
            </p>

            <div className="flex items-center gap-3">
              <Link
                href={`/watch/${movie.id}`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      {cast.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <h2 className="text-lg font-bold text-white">Cast</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {cast.map((c) => (
              <div key={c.id} className="flex-shrink-0 w-[130px] text-center">
                <div className="w-[130px] h-[130px] rounded-xl overflow-hidden bg-[#1B1B1B] ring-1 ring-white/[0.06] mb-2">
                  {c.profile_path ? (
                    <img src={getImageUrl(c.profile_path, "w185")} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-bold">?</div>
                  )}
                </div>
                <p className="text-xs font-medium text-white/80 truncate">{c.name}</p>
                <p className="text-[10px] text-white/40 truncate">{c.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trailers */}
      {trailers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <h2 className="text-lg font-bold text-white">Trailers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trailers.map((t) => (
              <a
                key={t.id}
                href={`https://youtube.com/watch?v=${t.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#121218] border border-white/[0.06] hover:border-accent/30 hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-12 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 text-white/60 group-hover:text-accent transition-colors" />
                </div>
                <span className="text-sm text-white/60 group-hover:text-white transition-colors truncate">{t.name}</span>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
