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
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Studios</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {studios.map((studio) => (
          <Link
            key={studio.id}
            href={`/studio/${studio.id}`}
            className="h-[180px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition-all group"
          >
            {studio.logo_path ? (
              <img
                src={getImageUrl(studio.logo_path, "w500")}
                alt={studio.name}
                className="max-w-[70%] max-h-[60%] object-contain opacity-60 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                <Building2 className="w-8 h-8" />
                <span className="text-xs font-medium text-center px-2">
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
