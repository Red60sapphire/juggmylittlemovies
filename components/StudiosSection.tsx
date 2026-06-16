import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface Studio {
  id: number;
  name: string;
  logo_path: string | null;
}

interface Props {
  studios: Studio[];
}

export default function StudiosSection({ studios }: Props) {
  if (!studios.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">Studios</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {studios.map((studio) => (
          <Link
            key={studio.id}
            href={`/studio/${studio.id}`}
            className="group relative h-[170px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-accent/40 hover:bg-white/[0.06] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {studio.logo_path ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={getImageUrl(studio.logo_path, "w500")}
                  alt={studio.name}
                  className="max-w-[80%] max-h-[65%] object-contain opacity-50 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 h-full text-white/30 group-hover:text-white/60 transition-colors">
                <Building2 className="w-10 h-10" />
                <span className="text-sm font-medium text-center px-4 line-clamp-2">
                  {studio.name}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
