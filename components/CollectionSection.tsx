import Link from "next/link";
import { getBackdropUrl } from "@/lib/utils";
import { Film } from "lucide-react";

interface CollectionData {
  id: number;
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
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">Collections</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collection/${col.id}`}
            className="group relative h-[180px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-accent/40 transition-all duration-300"
          >
            {col.backdrop_path ? (
              <>
                <img
                  src={getBackdropUrl(col.backdrop_path) || ""}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                <Film className="w-10 h-10 text-white/15" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                {col.name}
              </h3>
              <span className="text-xs text-white/50 mt-1 block">
                {col.movies.length} {col.movies.length === 1 ? "movie" : "movies"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
