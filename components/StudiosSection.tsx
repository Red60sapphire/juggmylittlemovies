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
    <section className="mb-7 md:mb-6">
      <h2 className="text-xl md:text-base font-bold text-white mb-4 md:mb-3 tracking-tight">Studios</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-2">
        {studios.map((studio) => (
          <Link
            key={studio.id}
            href={`/studio/${studio.id}`}
            className="group relative h-[90px] sm:h-[100px] md:h-[140px] rounded-2xl overflow-hidden bg-[#1F1F1F] border border-[#2A2A2A] hover:border-accent/40 hover:bg-[#222] transition-all duration-200"
          >
            {studio.logo_path ? (
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-4 md:p-5">
                <img
                  src={getImageUrl(studio.logo_path, "w500")}
                  alt={studio.name}
                  className="w-[70%] sm:w-[65%] md:w-[75%] h-auto max-h-[65%] object-contain opacity-65 group-hover:opacity-90 group-hover:scale-105 transition-all duration-200"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 h-full text-[#555] group-hover:text-white/60 transition-colors">
                <Building2 className="w-7 h-7 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                <span className="text-xs sm:text-xs font-medium text-center px-2 line-clamp-2">
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
