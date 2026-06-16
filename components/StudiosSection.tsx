import Link from "next/link";
import { getImageUrl } from "@/lib/utils";

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
    <section className="mb-8 md:mb-6">
      <h2 className="text-xl md:text-base font-bold text-white mb-4 md:mb-3 tracking-tight">Studios</h2>
      <div className="grid grid-cols-2 gap-3">
        {studios.map((studio) => (
          <Link
            key={studio.id}
            href={`/studio/${studio.id}`}
            className="group h-[120px] rounded-[18px] overflow-hidden bg-[#e5e5e5] hover:bg-white transition-all duration-200"
          >
            {studio.logo_path ? (
              <div className="w-full h-full flex items-center justify-center p-3">
                <img
                  src={getImageUrl(studio.logo_path, "w500")}
                  alt={studio.name}
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm font-semibold text-[#333]">
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
