import { getMovieDetails } from "@/lib/tmdb";
import { getImageUrl, getBackdropUrl, formatRating, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Play, Star, Clock, Calendar } from "lucide-react";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieDetails(parseInt(id));

  return (
    <div>
      <div className="relative h-[50vh] rounded-2xl overflow-hidden mb-8">
        <img
          src={getBackdropUrl(movie.backdrop_path) || ""}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
      </div>

      <div className="flex gap-8 -mt-32 relative z-10">
        <div className="w-[200px] flex-shrink-0 hidden md:block">
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full rounded-xl shadow-2xl"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {movie.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-white/60 mb-4 flex-wrap">
            <span className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              {movie.vote_average?.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(movie.release_date)}
            </span>
            {movie.runtime && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            )}
            {movie.genres?.map((g: { id: number; name: string }) => (
              <span
                key={g.id}
                className="px-2 py-0.5 bg-white/10 rounded-md text-xs"
              >
                {g.name}
              </span>
            ))}
          </div>

          <p className="text-white/70 leading-relaxed mb-6 max-w-2xl">
            {movie.overview}
          </p>

          <Link
            href={`/watch/${movie.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Play className="w-5 h-5 fill-white" />
            Watch Now
          </Link>
        </div>
      </div>
    </div>
  );
}
