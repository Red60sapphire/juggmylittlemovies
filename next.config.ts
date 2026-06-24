import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "uploads.mangadex.org" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://image.tmdb.org https://uploads.mangadex.org https://img.youtube.com",
              "frame-src 'self' https://vidsrc.dev https://vidsrc.to https://vidsrc.pro https://vidsrc.xyz https://vidsrc.icu https://embed.su https://embeds.to https://www.2embed.cc https://www.2embed.to https://vidlink.pro https://vidbinge.dev https://multiembed.mov https://embed.smashystream.com https://autoembed.cc https://*.mangadex.org",
              "connect-src 'self' https://*.supabase.co https://api.mangadex.org https://uploads.mangadex.org https://api.themoviedb.org",
              "media-src 'self'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
