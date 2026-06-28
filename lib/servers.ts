import type { VideoSource } from "@/types";

interface AnimeServerConfig {
  name: string;
  buildUrl: (anilistId: number, episode: number) => string;
}

const MOVIE_SERVERS: ServerConfig[] = [
  {
    name: "VidSrc To",
    buildUrl: (id, _s, _e, imdb) =>
      `https://vidsrc.to/embed/movie/${imdb || id}`,
  },
  {
    name: "VidSrc Me",
    buildUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    name: "Embed.su",
    buildUrl: (id) => `https://embed.su/embed/movie/${id}`,
  },
  {
    name: "MultiEmbed",
    buildUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    name: "AutoEmbed",
    buildUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
  },
  {
    name: "Smashy",
    buildUrl: (id) => `https://player.smashy.stream/movie/${id}`,
  },
  {
    name: "2Embed",
    buildUrl: (id) => `https://www.2embed.cc/embed/${id}`,
  },
  {
    name: "VidSrc XYZ",
    buildUrl: (id, _s, _e, imdb) =>
      `https://vidsrc.xyz/embed/movie/${imdb || id}`,
  },
];

const TV_SERVERS: ServerConfig[] = [
  {
    name: "VidSrc To",
    buildUrl: (id, s, e, imdb) =>
      `https://vidsrc.to/embed/tv/${imdb || id}/${s}/${e}`,
  },
  {
    name: "VidSrc Me",
    buildUrl: (id, s, e) =>
      `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: "Embed.su",
    buildUrl: (id, s, e) =>
      `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "MultiEmbed",
    buildUrl: (id, s, e) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    name: "AutoEmbed",
    buildUrl: (id, s, e) =>
      `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "Smashy",
    buildUrl: (id, s, e) =>
      `https://player.smashy.stream/tv/${id}/${s}/${e}`,
  },
  {
    name: "2Embed",
    buildUrl: (id, s, e) =>
      `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    name: "VidSrc XYZ",
    buildUrl: (id, s, e, imdb) =>
      `https://vidsrc.xyz/embed/tv/${imdb || id}/${s}/${e}`,
  },
];

interface ServerConfig {
  name: string;
  buildUrl: (id: number, season?: number, episode?: number, imdbId?: string) => string;
}

const ANIME_SERVERS: AnimeServerConfig[] = [
  {
    name: "AllAnime",
    buildUrl: (anilistId, episode) =>
      `https://allanime.to/anime/${anilistId}/episode-${episode}`,
  },
  {
    name: "HiAnime",
    buildUrl: (anilistId, episode) =>
      `https://hianime.to/ajax/episode/${anilistId}/${episode}`,
  },
  {
    name: "AniWatch",
    buildUrl: (anilistId, episode) =>
      `https://aniwatch.to/watch/${anilistId}?ep=${episode}`,
  },
  {
    name: "Yugen",
    buildUrl: (anilistId, episode) =>
      `https://yugenanime.tv/watch/${anilistId}/${episode}/`,
  },
];

export function getServersForMovie(tmdbId: number, imdbId?: string): VideoSource[] {
  return MOVIE_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId, undefined, undefined, imdbId),
    type: "embed" as const,
  }));
}

export function getServersForTV(tmdbId: number, season: number, episode: number, imdbId?: string): VideoSource[] {
  return TV_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId, season, episode, imdbId),
    type: "embed" as const,
  }));
}

export function getServersForAnime(anilistId: number, episode: number): VideoSource[] {
  return ANIME_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(anilistId, episode),
    type: "embed" as const,
  }));
}
