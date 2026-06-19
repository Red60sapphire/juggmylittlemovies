import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Juggmylittlemovies - Watch Movies & TV Shows Online Free",
    short_name: "Juggmylittlemovies",
    description:
      "Stream movies, TV shows, anime, and live TV in HD. Free streaming platform with trending content, watchlist, and watch history.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
