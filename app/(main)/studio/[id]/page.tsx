import { getCompany, getCompanyMovies } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/utils";
import MovieGrid from "@/components/MovieGrid";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = parseInt(id);
  const [company, data] = await Promise.all([
    getCompany(companyId),
    getCompanyMovies(companyId),
  ]);

  return (
    <div>
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
          {data.total_results || data.results?.length || 0} movies
        </span>
      </div>
      <MovieGrid movies={data.results || []} />
    </div>
  );
}
