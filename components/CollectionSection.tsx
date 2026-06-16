import Link from "next/link";
import { getBackdropUrl } from "@/lib/utils";
import { Film } from "lucide-react";

interface CollectionData {
  name: string;
  backdrop_path?: string | null;
  movies: { id: number; title?: string; poster_path: string | null }[];
}

interface Props {
  collections: CollectionData[];
}

export default function CollectionSection({ collections }: Props) {
  if (!collections.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Collections</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {collections.map((col) => (
          <Link
            key={col.name}
            href={`/search?q=${encodeURIComponent(col.name)}`}
            className="group relative h-[170px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all"
          >
            {col.backdrop_path ? (
              <img
                src={getBackdropUrl(col.backdrop_path) || ""}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-10 h-10 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-sm font-semibold text-white">{col.name}</h3>
              <span className="text-xs text-white/60 mt-0.5 block">
                {col.movies.length} {col.movies.length === 1 ? "movie" : "movies"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
