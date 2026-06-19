import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

function isManifest(url: string): boolean {
  return url.includes(".m3u8");
}

function rewriteManifest(body: string, baseUrl: string, stripAudio: boolean): string {
  const proxyBase = "/api/live/stream?url=";

  // Rewrite standalone .m3u8 lines (variant URLs)
  let result = body.replace(
    /^([^#\n\r][^\n\r]*\.m3u8[^\n\r]*)(?:\r?\n|$)/gm,
    (line: string) => {
      const trimmed = line.trim();
      const absolute = resolveUrl(baseUrl, trimmed);
      return `${proxyBase}${encodeURIComponent(absolute)}\n`;
    }
  );

  // Rewrite URI="..." references in HLS tags (audio, subtitle, etc.)
  result = result.replace(
    /URI="([^"]*\.m3u8[^"]*)"/g,
    (_match, uri: string) => {
      const absolute = resolveUrl(baseUrl, uri);
      return `URI="${proxyBase}${encodeURIComponent(absolute)}"`;
    }
  );

  // Debug: strip audio rendition tracks
  if (stripAudio) {
    result = result
      .split(/\r?\n/)
      .filter((line) => !line.includes('#EXT-X-MEDIA:TYPE=AUDIO'))
      .join('\n');
  }

  return result;
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const decodedUrl = decodeURIComponent(urlParam);
  const stripAudio = req.nextUrl.searchParams.has("stripAudio");

  const allowedDomains = ["pluto.tv", "fifaworldcup.cfd", "cdn.totalsportek.eu.cc"];
  const isAllowed = allowedDomains.some((d) => decodedUrl.includes(d));
  if (!isAllowed) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 403 });
  }

  try {
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Origin: decodedUrl.includes("fifaworldcup.cfd") ? "https://fifaworldcup.cfd" : "http://pluto.tv",
        Referer: decodedUrl.includes("fifaworldcup.cfd") ? "https://fifaworldcup.cfd/" : "http://pluto.tv/",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const isM3u8 = contentType.includes("mpegurl") || contentType.includes("m3u8") || isManifest(decodedUrl);

    if (isM3u8) {
      const text = await response.text();
      const rewritten = rewriteManifest(text, decodedUrl, stripAudio);

      return new NextResponse(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "no-cache",
        },
      });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
