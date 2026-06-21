import { NextRequest, NextResponse } from "next/server";
import { getTrending, getTrendingMultiPage } from "@/lib/tmdb";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`trending:${ip}`, 20, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const allPages = request.nextUrl.searchParams.get("all") === "true";
  try {
    const data = allPages ? await getTrendingMultiPage() : await getTrending();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
