import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
} from "@/lib/tmdb";

export const browsePages = {
  trending: { title: "Trending", fetcher: getTrending },
  popular: { title: "Popular", fetcher: getPopular },
  "top-rated": { title: "Top Rated", fetcher: getTopRated },
  "now-playing": { title: "Now Playing", fetcher: getNowPlaying },
};

export type BrowseKey = keyof typeof browsePages;
