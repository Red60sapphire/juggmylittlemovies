import type { VideoSource } from "@/types";

interface ServerConfig {
  name: string;
  buildUrl: (tmdbId: number, season?: number, episode?: number) => string;
  type: "embed" | "direct";
}

export const VIDEO_SERVERS: ServerConfig[] = [
  // VidSrc mirrors (most reliable)
  { name: "VidSrc", buildUrl: (id, s, e) => s && e ? `https://vidsrc.dev/embed/tv/${id}/${s}/${e}` : `https://vidsrc.dev/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 2", buildUrl: (id, s, e) => s && e ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}` : `https://vidsrc.to/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 3", buildUrl: (id, s, e) => s && e ? `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` : `https://vidsrc.pro/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 4", buildUrl: (id, s, e) => s && e ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` : `https://vidsrc.xyz/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 5", buildUrl: (id, s, e) => s && e ? `https://vidsrc.icu/embed/tv/${id}/${s}/${e}` : `https://vidsrc.icu/embed/movie/${id}`, type: "embed" },

  // Embed.su mirrors
  { name: "Embed.su", buildUrl: (id, s, e) => s && e ? `https://embed.su/embed/tv/${id}/${s}/${e}` : `https://embed.su/embed/movie/${id}`, type: "embed" },
  { name: "Embeds.to", buildUrl: (id, s, e) => s && e ? `https://embeds.to/embed/tv/${id}/${s}/${e}` : `https://embeds.to/embed/movie/${id}`, type: "embed" },

  // 2Embed mirrors
  { name: "2Embed", buildUrl: (id, s, e) => s && e ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${id}`, type: "embed" },
  { name: "2Embed To", buildUrl: (id, s, e) => s && e ? `https://www.2embed.to/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.to/embed/${id}`, type: "embed" },

  // Dedicated platforms
  { name: "VidLink", buildUrl: (id, s, e) => s && e ? `https://vidlink.pro/tv/${id}/${s}/${e}` : `https://vidlink.pro/movie/${id}`, type: "embed" },
  { name: "VidBinge", buildUrl: (id, s, e) => s && e ? `https://vidbinge.dev/embed/tv/${id}/${s}/${e}` : `https://vidbinge.dev/embed/movie/${id}`, type: "embed" },
  { name: "MultiEmbed", buildUrl: (id, s, e) => s && e ? `https://multiembed.mov/?video_id=${id}&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${id}`, type: "embed" },
  { name: "SmashyStream", buildUrl: (id, s, e) => s && e ? `https://embed.smashystream.com/playere/?tmdb=${id}&s=${s}&e=${e}` : `https://embed.smashystream.com/playere/?tmdb=${id}`, type: "embed" },
  { name: "AutoEmbed", buildUrl: (id, s, e) => s && e ? `https://autoembed.cc/embed/tv/${id}/${s}/${e}` : `https://autoembed.cc/embed/movie/${id}`, type: "embed" },
];

export function getServersForMovie(tmdbId: number): VideoSource[] {
  return VIDEO_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId),
    type: s.type,
  }));
}

export function getServersForTV(tmdbId: number, season: number, episode: number): VideoSource[] {
  return VIDEO_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId, season, episode),
    type: s.type,
  }));
}
