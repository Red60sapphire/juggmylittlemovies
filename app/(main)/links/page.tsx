import { Globe, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Active Domains",
  description: "Access Zynema from any of our active domains. If one domain is blocked, try another.",
};

const DOMAINS = [
  { url: "https://zynema.co", label: "zynema.co" },
  { url: "https://zynema.shop", label: "zynema.shop" },
  { url: "https://zynema.info", label: "zynema.info" },
  { url: "https://mobmovies.co", label: "mobmovies.co" },
  { url: "https://damovies.net", label: "damovies.net" },
];

export default function LinksPage() {
  return (
    <main id="main-content" className="max-w-[600px] mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Active Domains</h1>
          <p className="text-sm text-white/40 mt-0.5">Access Zynema from any of these links</p>
        </div>
      </div>

      <div className="space-y-3">
        {DOMAINS.map((domain) => (
          <a
            key={domain.url}
            href={domain.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-accent/30 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Globe className="w-5 h-5 text-accent/60 group-hover:text-accent transition-colors flex-shrink-0" />
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors truncate">
                {domain.label}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors flex-shrink-0" />
          </a>
        ))}
      </div>

      <div className="mt-10 p-4 rounded-xl bg-accent/5 border border-accent/10">
        <p className="text-xs text-white/40 leading-relaxed">
          If one domain is blocked in your region, try another. All domains point to the same service.
        </p>
      </div>
    </main>
  );
}