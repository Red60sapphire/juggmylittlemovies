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
    <section className="mb-5 md:mb-6">
      <h2 className="text-lg md:text-base font-bold text-white mb-3">Studios</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-2">
        {studios.map((studio) => (
          <Link
            key={studio.id}
            href={`/studio/${studio.id}`}
            className="group relative h-[80px] sm:h-[100px] md:h-[140px] rounded-xl overflow-hidden bg-[#171717] border border-[#2A2A2A] hover:border-accent/40 hover:bg-[#1B1B1B] transition-all duration-200"
          >
            {studio.logo_path ? (
              <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-5">
                <img
                  src={getImageUrl(studio.logo_path, "w500")}
                  alt={studio.name}
                  className="max-w-[90%] sm:max-w-[80%] md:max-w-[75%] max-h-[70%] sm:max-h-[65%] md:max-h-[60%] object-contain opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-200"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 h-full text-[#555] group-hover:text-white/60 transition-colors">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                <span className="text-[11px] sm:text-xs font-medium text-center px-1 line-clamp-2">
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
