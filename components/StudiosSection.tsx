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
    <section className="mb-6">
      <h2 className="text-base font-bold text-white mb-3">Studios</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {studios.map((studio) => (
          <Link
            key={studio.id}
            href={`/studio/${studio.id}`}
            className="group relative h-[140px] rounded-xl overflow-hidden bg-[#171717] border border-[#2A2A2A] hover:border-accent/40 hover:bg-[#1B1B1B] transition-all duration-200"
          >
            {studio.logo_path ? (
              <div className="w-full h-full flex items-center justify-center p-5">
                <img
                  src={getImageUrl(studio.logo_path, "w500")}
                  alt={studio.name}
                  className="max-w-[75%] max-h-[60%] object-contain opacity-50 group-hover:opacity-90 group-hover:scale-105 transition-all duration-200"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 h-full text-[#555] group-hover:text-white/60 transition-colors">
                <Building2 className="w-8 h-8" />
                <span className="text-xs font-medium text-center px-2 line-clamp-2">
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
