import type { VideoSource } from "@/types";

interface ServerConfig {
  name: string;
  buildUrl: (tmdbId: number, season?: number, episode?: number) => string;
  type: "embed" | "direct";
}

export const VIDEO_SERVERS: ServerConfig[] = [
  // === Most reliable: vidsrc mirrors ===
  { name: "VidSrc", buildUrl: (id, s, e) => s && e ? `https://vidsrc.dev/embed/tv/${id}/${s}/${e}` : `https://vidsrc.dev/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 2", buildUrl: (id, s, e) => s && e ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}` : `https://vidsrc.to/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 3", buildUrl: (id, s, e) => s && e ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` : `https://vidsrc.xyz/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 4", buildUrl: (id, s, e) => s && e ? `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` : `https://vidsrc.pro/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 5", buildUrl: (id, s, e) => s && e ? `https://vidsrc.icu/embed/tv/${id}/${s}/${e}` : `https://vidsrc.icu/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 6", buildUrl: (id, s, e) => s && e ? `https://vidsrc.cc/embed/tv/${id}/${s}/${e}` : `https://vidsrc.cc/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 7", buildUrl: (id, s, e) => s && e ? `https://vidsrc.me/embed/tv/${id}/${s}/${e}` : `https://vidsrc.me/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 8", buildUrl: (id, s, e) => s && e ? `https://vidsrc.network/embed/tv/${id}/${s}/${e}` : `https://vidsrc.network/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 9", buildUrl: (id, s, e) => s && e ? `https://vidsrc.vc/embed/tv/${id}/${s}/${e}` : `https://vidsrc.vc/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 10", buildUrl: (id, s, e) => s && e ? `https://vidsrc.rip/embed/tv/${id}/${s}/${e}` : `https://vidsrc.rip/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 11", buildUrl: (id, s, e) => s && e ? `https://vidsrc.wtf/embed/tv/${id}/${s}/${e}` : `https://vidsrc.wtf/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 12", buildUrl: (id, s, e) => s && e ? `https://vidsrc.club/embed/tv/${id}/${s}/${e}` : `https://vidsrc.club/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 13", buildUrl: (id, s, e) => s && e ? `https://vidsrc.life/embed/tv/${id}/${s}/${e}` : `https://vidsrc.life/embed/movie/${id}`, type: "embed" },
  { name: "VidSrc 14", buildUrl: (id, s, e) => s && e ? `https://vidsrc.nl/embed/tv/${id}/${s}/${e}` : `https://vidsrc.nl/embed/movie/${id}`, type: "embed" },

  // === Embed.su mirrors ===
  { name: "Embed.su", buildUrl: (id, s, e) => s && e ? `https://embed.su/embed/tv/${id}/${s}/${e}` : `https://embed.su/embed/movie/${id}`, type: "embed" },
  { name: "Embed.rip", buildUrl: (id, s, e) => s && e ? `https://embed.rip/embed/tv/${id}/${s}/${e}` : `https://embed.rip/embed/movie/${id}`, type: "embed" },
  { name: "Embed.to", buildUrl: (id, s, e) => s && e ? `https://embeds.to/embed/tv/${id}/${s}/${e}` : `https://embeds.to/embed/movie/${id}`, type: "embed" },
  { name: "Embed PRO", buildUrl: (id, s, e) => s && e ? `https://embed.pro/embed/tv/${id}/${s}/${e}` : `https://embed.pro/embed/movie/${id}`, type: "embed" },
  { name: "Embed XYZ", buildUrl: (id, s, e) => s && e ? `https://embedw.xyz/embed/tv/${id}/${s}/${e}` : `https://embedw.xyz/embed/movie/${id}`, type: "embed" },

  // === 2Embed mirrors ===
  { name: "2Embed", buildUrl: (id, s, e) => s && e ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${id}`, type: "embed" },
  { name: "2Embed Dev", buildUrl: (id, s, e) => s && e ? `https://www.2embed.dev/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.dev/embed/${id}`, type: "embed" },
  { name: "2Embed Org", buildUrl: (id, s, e) => s && e ? `https://www.2embed.org/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.org/embed/${id}`, type: "embed" },
  { name: "2Embed To", buildUrl: (id, s, e) => s && e ? `https://www.2embed.to/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.to/embed/${id}`, type: "embed" },
  { name: "2Embed Skin", buildUrl: (id, s, e) => s && e ? `https://2embed.skin/embedtv/${id}&s=${s}&e=${e}` : `https://2embed.skin/embed/${id}`, type: "embed" },

  // === Multi-embed / superembed ===
  { name: "MultiEmbed", buildUrl: (id, s, e) => s && e ? `https://multiembed.mov/?video_id=${id}&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${id}`, type: "embed" },
  { name: "SuperEmbed", buildUrl: (id, s, e) => s && e ? `https://multiembed.mov/?video_id=${id}&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${id}&tmdb=1`, type: "embed" },

  // === Dedicated streaming platforms ===
  { name: "VidLink", buildUrl: (id, s, e) => s && e ? `https://vidlink.pro/tv/${id}/${s}/${e}` : `https://vidlink.pro/movie/${id}`, type: "embed" },
  { name: "VidBinge", buildUrl: (id, s, e) => s && e ? `https://vidbinge.dev/embed/tv/${id}/${s}/${e}` : `https://vidbinge.dev/embed/movie/${id}`, type: "embed" },
  { name: "AutoEmbed", buildUrl: (id, s, e) => s && e ? `https://autoembed.cc/embed/tv/${id}/${s}/${e}` : `https://autoembed.cc/embed/movie/${id}`, type: "embed" },
  { name: "VidKing", buildUrl: (id, s, e) => s && e ? `https://www.vidking.net/embed/tv/${id}/${s}/${e}` : `https://www.vidking.net/embed/movie/${id}`, type: "embed" },
  { name: "API Player", buildUrl: (id, s, e) => s && e ? `https://apiplayer.ru/embed/tv/${id}/${s}/${e}` : `https://apiplayer.ru/embed/movie/${id}`, type: "embed" },
  { name: "SmashyStream", buildUrl: (id, s, e) => s && e ? `https://embed.smashystream.com/playere/?tmdb=${id}&s=${s}&e=${e}` : `https://embed.smashystream.com/playere/?tmdb=${id}`, type: "embed" },
  { name: "Cineby", buildUrl: (id, s, e) => s && e ? `https://cineby.app/embed/tv/${id}/${s}/${e}` : `https://cineby.app/embed/movie/${id}`, type: "embed" },
  { name: "GomoPlayer", buildUrl: (id, s, e) => s && e ? `https://gomoplayers.com/embed/tv/${id}/${s}/${e}` : `https://gomoplayers.com/embed/movie/${id}`, type: "embed" },
  { name: "DBgo", buildUrl: (id, s, e) => s && e ? `https://dbgo.fun/embed/tv/${id}/${s}/${e}` : `https://dbgo.fun/embed/movie/${id}`, type: "embed" },
  { name: "PlayerWatch", buildUrl: (id, s, e) => s && e ? `https://playerwatch.dev/embed/tv/${id}/${s}/${e}` : `https://playerwatch.dev/embed/movie/${id}`, type: "embed" },
  { name: "MegaFlix", buildUrl: (id, s, e) => s && e ? `https://megaflix.dev/embed/tv/${id}/${s}/${e}` : `https://megaflix.dev/embed/movie/${id}`, type: "embed" },
  { name: "StreamFlix", buildUrl: (id, s, e) => s && e ? `https://streamflix.space/embed/tv/${id}/${s}/${e}` : `https://streamflix.space/embed/movie/${id}`, type: "embed" },
  { name: "Lani", buildUrl: (id, s, e) => s && e ? `https://lani.xyz/embed/tv/${id}/${s}/${e}` : `https://lani.xyz/embed/movie/${id}`, type: "embed" },
  { name: "Nyaa", buildUrl: (id, s, e) => s && e ? `https://nyaa.xyz/embed/tv/${id}/${s}/${e}` : `https://nyaa.xyz/embed/movie/${id}`, type: "embed" },
  { name: "Aura", buildUrl: (id, s, e) => s && e ? `https://aura.xyz/embed/tv/${id}/${s}/${e}` : `https://aura.xyz/embed/movie/${id}`, type: "embed" },
  { name: "VidStreamz", buildUrl: (id, s, e) => s && e ? `https://vidstreamz.site/embed/tv/${id}/${s}/${e}` : `https://vidstreamz.site/embed/movie/${id}`, type: "embed" },
  { name: "StreamVid", buildUrl: (id, s, e) => s && e ? `https://streamvid.net/embed/tv/${id}/${s}/${e}` : `https://streamvid.net/embed/movie/${id}`, type: "embed" },
  { name: "GoPlay", buildUrl: (id, s, e) => s && e ? `https://goplay.dev/embed/tv/${id}/${s}/${e}` : `https://goplay.dev/embed/movie/${id}`, type: "embed" },
  { name: "SuperVideo", buildUrl: (id, s, e) => s && e ? `https://supervideo.tv/embed/tv/${id}/${s}/${e}` : `https://supervideo.tv/embed/movie/${id}`, type: "embed" },
  { name: "LetsEmbed", buildUrl: (id, s, e) => s && e ? `https://letsembed.net/embed/tv/${id}/${s}/${e}` : `https://letsembed.net/embed/movie/${id}`, type: "embed" },
  { name: "Stream4u", buildUrl: (id, s, e) => s && e ? `https://stream4u.dev/embed/tv/${id}/${s}/${e}` : `https://stream4u.dev/embed/movie/${id}`, type: "embed" },
  { name: "FreeEmbed", buildUrl: (id, s, e) => s && e ? `https://freeembed.dev/embed/tv/${id}/${s}/${e}` : `https://freeembed.dev/embed/movie/${id}`, type: "embed" },
  { name: "FlixHQ", buildUrl: (id, s, e) => s && e ? `https://flixhq.dev/embed/tv/${id}/${s}/${e}` : `https://flixhq.dev/embed/movie/${id}`, type: "embed" },
  { name: "WatchFlix", buildUrl: (id, s, e) => s && e ? `https://watchflix.dev/embed/tv/${id}/${s}/${e}` : `https://watchflix.dev/embed/movie/${id}`, type: "embed" },
  { name: "Rive", buildUrl: (id, s, e) => s && e ? `https://rive.stream/embed/tv/${id}/${s}/${e}` : `https://rive.stream/embed/movie/${id}`, type: "embed" },
  { name: "VidPlay", buildUrl: (id, s, e) => s && e ? `https://vidplay.site/embed/tv/${id}/${s}/${e}` : `https://vidplay.site/embed/movie/${id}`, type: "embed" },
  { name: "PlayEmbed", buildUrl: (id, s, e) => s && e ? `https://playembed.xyz/embed/tv/${id}/${s}/${e}` : `https://playembed.xyz/embed/movie/${id}`, type: "embed" },

  // === Legacy / unique URL patterns ===
  { name: "Stream2watch", buildUrl: (id, s, e) => s && e ? `https://stream2watch.dev/embed/tv/${id}/${s}/${e}` : `https://stream2watch.dev/embed/movie/${id}`, type: "embed" },
  { name: "MovieBox", buildUrl: (id, s, e) => s && e ? `https://movie-box.pro/embed/tv/${id}/${s}/${e}` : `https://movie-box.pro/embed/movie/${id}`, type: "embed" },
  { name: "ShowBox", buildUrl: (id, s, e) => s && e ? `https://showbox.dev/embed/tv/${id}/${s}/${e}` : `https://showbox.dev/embed/movie/${id}`, type: "embed" },
  { name: "CineHub", buildUrl: (id, s, e) => s && e ? `https://cinehub.dev/embed/tv/${id}/${s}/${e}` : `https://cinehub.dev/embed/movie/${id}`, type: "embed" },
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
