import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zynema.co";
  const routes = [
    "",
    "/movies",
    "/tv-shows",
    "/anime",
    "/live-tv",
    "/watchlist",
    "/history",
    "/continue-watching",
    "/links",
    "/sports",
    "/world-cup",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
