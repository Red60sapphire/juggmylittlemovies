import type { VideoSource } from "@/types";

interface ServerConfig {
  name: string;
  buildUrl: (tmdbId: number, season?: number, episode?: number, imdbId?: string) => string;
  type: "embed" | "direct";
}

export const VIDEO_SERVERS: ServerConfig[] = [
  {
    name: "juggmylittlemovies",
    buildUrl: (id, s, e, imdb) => {
      const mid = imdb || id;
      return s && e ? `https://vidsrc.xyz/embed/tv/${mid}/${s}/${e}` : `https://vidsrc.xyz/embed/movie/${mid}`;
    },
    type: "embed",
  },
  {
    name: "Embed.su",
    buildUrl: (id, s, e) =>
      s && e ? `https://embed.su/embed/tv/${id}/${s}/${e}` : `https://embed.su/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "MultiEmbed",
    buildUrl: (id, s, e) =>
      s && e
        ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`
        : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    type: "embed",
  },
  {
    name: "AutoEmbed",
    buildUrl: (id, s, e) =>
      s && e
        ? `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
        : `https://player.autoembed.cc/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "VidSrc Me",
    buildUrl: (id, s, e) =>
      s && e
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`,
    type: "embed",
  },
  {
    name: "VidSrc To",
    buildUrl: (id, s, e, imdb) => {
      const mid = imdb || id;
      return s && e ? `https://vidsrc.to/embed/tv/${mid}/${s}/${e}` : `https://vidsrc.to/embed/movie/${mid}`;
    },
    type: "embed",
  },
];

export function getServersForMovie(tmdbId: number, imdbId?: string): VideoSource[] {
  return VIDEO_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId, undefined, undefined, imdbId),
    type: s.type,
  }));
}

export function getServersForTV(tmdbId: number, season: number, episode: number, imdbId?: string): VideoSource[] {
  return VIDEO_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId, season, episode, imdbId),
    type: s.type,
  }));
}
