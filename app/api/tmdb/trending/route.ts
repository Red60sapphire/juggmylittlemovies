import { NextRequest, NextResponse } from "next/server";
import {
  getTrending, getTrendingMultiPage,
  getPopular, getPopularMultiPage,
  getTopRated,
  getTrendingTV, getTrendingTVMultiPage,
  getNowPlaying, getUpcoming,
} from "@/lib/tmdb";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limit = rateLimit(`trending:${ip}`, 30, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const type = request.nextUrl.searchParams.get("type") || "all";
  const allPages = request.nextUrl.searchParams.get("all") === "true";

  try {
    let data;
    switch (type) {
      case "popular":
        data = allPages ? await getPopularMultiPage(3) : await getPopular();
        break;
      case "top_rated":
        data = await getTopRated();
        break;
      case "trending_tv":
        data = allPages ? await getTrendingTVMultiPage(3) : await getTrendingTV();
        break;
      case "now_playing":
        data = await getNowPlaying();
        break;
      case "upcoming":
        data = await getUpcoming();
        break;
      default:
        data = allPages ? await getTrendingMultiPage(3) : await getTrending();
        break;
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
