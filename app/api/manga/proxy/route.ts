import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAINS = [
  "uploads.mangadex.org",
  "mangadex.org",
  "mangadex.network",
  ".mangadex.network",
];

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url") || "";

  if (!urlParam) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(urlParam);
    const parsed = new URL(decoded);
    if (!ALLOWED_DOMAINS.some((d) => parsed.hostname.endsWith(d))) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  try {
    const res = await fetch(decoded, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Referer": "https://mangadex.org/",
        "Accept": "image/avif,image/webp,image/apng,image/png,image/jpeg,*/*",
      },
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch", { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch", { status: 502 });
  }
}
