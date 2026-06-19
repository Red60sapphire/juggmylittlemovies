import type { VideoSource } from "@/types";

interface ServerConfig {
  name: string;
  buildUrl: (tmdbId: number, season?: number, episode?: number) => string;
  type: "embed" | "direct";
  sandbox?: boolean;
}

export const VIDEO_SERVERS: ServerConfig[] = [
  // Recommended servers first
  {
    name: "Zynema",
    buildUrl: (id, s, e) =>
      s && e ? `https://play.xpass.top/e/tv/${id}/${s}/${e}` : `https://play.xpass.top/e/movie/${id}`,
    type: "embed",
  },
  {
    name: "Core",
    buildUrl: (id, s, e) =>
      s && e ? `https://vidcore.net/tv/${id}/${s}/${e}` : `https://vidcore.net/movie/${id}`,
    type: "embed",
  },
  {
    name: "VidSrc",
    buildUrl: (id, s, e) =>
      s && e ? `https://vsembed.ru/embed/tv/${id}/${s}/${e}` : `https://vsembed.ru/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "ZxcStream",
    buildUrl: (id, s, e) =>
      s && e ? `https://www.zxcstream.xyz/player/tv/${id}/${s}/${e}` : `https://www.zxcstream.xyz/player/movie/${id}`,
    type: "embed",
    sandbox: true,
  },
  // Other working servers
  {
    name: "CinemaOS",
    buildUrl: (id, s, e) =>
      s && e ? `https://cinemaos.tech/player/${id}/${s}/${e}` : `https://cinemaos.tech/player/${id}`,
    type: "embed",
    sandbox: true,
  },
  {
    name: "Vid2",
    buildUrl: (id, s, e) =>
      s && e ? `https://airflix1.com/embed/tv/${id}/${s}/${e}` : `https://airflix1.com/embed/movie/${id}`,
    type: "embed",
    sandbox: true,
  },
  {
    name: "Peach",
    buildUrl: (id, s, e) =>
      s && e ? `https://peachify.top/embed/tv/${id}/${s}/${e}` : `https://peachify.top/embed/movie/${id}`,
    type: "embed",
  },
  {
    name: "Mapi",
    buildUrl: (id, s, e) =>
      s && e ? `https://vidzen.fun/tv/${id}/${s}/${e}` : `https://vidzen.fun/movie/${id}`,
    type: "embed",
    sandbox: true,
  },
  {
    name: "VidPlays",
    buildUrl: (id, s, e) =>
      s && e ? `https://vidplays.fun/embed/tv/${id}/${s}/${e}` : `https://vidplays.fun/embed/movie/${id}`,
    type: "embed",
    sandbox: true,
  },
  {
    name: "VidEasy",
    buildUrl: (id, s, e) =>
      s && e ? `https://player.videasy.net/tv/${id}/${s}/${e}` : `https://player.videasy.net/movie/${id}`,
    type: "embed",
  },
  {
    name: "ScreenScape",
    buildUrl: (id, s, e) =>
      s && e ? `https://screenscape.me/embed?tmdb=${id}&type=tv&s=${s}&e=${e}` : `https://screenscape.me/embed?tmdb=${id}&type=movie`,
    type: "embed",
    sandbox: true,
  },
  // International sources
  {
    name: "French",
    buildUrl: (id, s, e) =>
      s && e ? `https://frembed.buzz/api/serie.php?id=${id}&sa=${s}&epi=${e}` : `https://frembed.buzz/api/film.php?id=${id}`,
    type: "embed",
  },
  {
    name: "Spanish",
    buildUrl: (id, s, e) =>
      s && e ? `https://play.modocine.com/play.php/embed/tv/${id}/${s}/${e}` : `https://play.modocine.com/play.php/embed/movie/${id}`,
    type: "embed",
    sandbox: true,
  },
  {
    name: "Italian",
    buildUrl: (id, s, e) =>
      s && e ? `https://vixsrc.to/tv/${id}/${s}/${e}?lang=it` : `https://vixsrc.to/movie/${id}?lang=it`,
    type: "embed",
  },
];

export function getServersForMovie(tmdbId: number): VideoSource[] {
  return VIDEO_SERVERS.map((s) => ({
    name: s.name,
    url: s.buildUrl(tmdbId),
    type: s.type,
    sandbox: s.sandbox,
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
    sandbox: s.sandbox,
  }));
}
