import { NextRequest, NextResponse } from "next/server";
import { getAnime } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") || "1";
  try {
    const data = await getAnime(parseInt(page));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
