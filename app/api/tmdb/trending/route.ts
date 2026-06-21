import { NextRequest, NextResponse } from "next/server";
import { getTrending, getTrendingMultiPage } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const allPages = request.nextUrl.searchParams.get("all") === "true";
  try {
    const data = allPages ? await getTrendingMultiPage() : await getTrending();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
