import type { VideoSource } from "@/types";

interface ServerConfig {
  name: string;
  buildUrl: (tmdbId: number, season?: number, episode?: number) => string;
  type: "embed" | "direct";
}

export const VIDEO_SERVERS: ServerConfig[] = [
  {
    name: "VidSrc",
    buildUrl: (id) => `https://vidsrc.dev/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "VidSrc 2",
    buildUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "VidSrc 3",
    buildUrl: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "EmbedMaster",
    buildUrl: (id) => `https://embedmaster.link/movie/${id}`,
    type: "embed",
  },
  {
    name: "API Player",
    buildUrl: (id) => `https://apiplayer.ru/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "MultiEmbed",
    buildUrl: (id) => `https://multiembed.mov/?video_id=${id}`,
    type: "embed",
  },
  {
    name: "AutoEmbed",
    buildUrl: (id) => `https://autoembed.cc/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "VidLink",
    buildUrl: (id) => `https://vidlink.pro/movie/${id}`,
    type: "embed",
  },
  {
    name: "2Embed",
    buildUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    type: "embed",
  },
  {
    name: "VidBinge",
    buildUrl: (id) => `https://vidbinge.dev/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "DBMovie",
    buildUrl: (id) => `https://dbmovie.xyz/movie/${id}`,
    type: "embed",
  },
  {
    name: "GoStream",
    buildUrl: (id) => `https://gostream.pro/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "M4UFree",
    buildUrl: (id) => `https://m4ufree.tv/embed/${id}`,
    type: "embed",
  },
];

export function getServersForMovie(tmdbId: number): VideoSource[] {
  return VIDEO_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId),
    type: s.type,
  }));
}

export function getServersForTV(
  tmdbId: number,
  season: number,
  episode: number
): VideoSource[] {
  return VIDEO_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId, season, episode),
    type: s.type,
  }));
}
