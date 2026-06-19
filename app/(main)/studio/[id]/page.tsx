import { getCompany, getCompanyMovies } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/utils";
import MovieGrid from "@/components/MovieGrid";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = await getCompany(parseInt(id));
  return {
    title: company.name,
    description: `Browse movies from ${company.name}. Stream films produced by ${company.name} in HD on Juggmylittlemovies.`,
    openGraph: {
      title: `${company.name} | Juggmylittlemovies`,
      description: `Browse movies from ${company.name}.`,
    },
  };
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = parseInt(id);

  const company = await getCompany(companyId);
  
  const pages = await Promise.all(
    Array.from({ length: 5 }, (_, i) => getCompanyMovies(companyId, i + 1))
  );
  const allMovies = pages.flatMap((p) => p.results || []);
  const totalResults = pages[0]?.total_results || allMovies.length;

  return (
    <main id="main-content">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        {company.logo_path ? (
          <img
            src={getImageUrl(company.logo_path, "w500")}
            alt={company.name}
            className="h-10 object-contain"
          />
        ) : (
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
          </div>
        )}
        <span className="text-white/40 text-sm">
          {totalResults} movies &bull; showing {allMovies.length}
        </span>
      </div>
      <MovieGrid movies={allMovies} />
    </main>
  );
}
