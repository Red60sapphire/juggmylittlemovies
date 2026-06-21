import { NextRequest, NextResponse } from "next/server";
import { getCompanyMoviesAll, getCompanyMovies } from "@/lib/tmdb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const allPages = request.nextUrl.searchParams.get("all") === "true";

  try {
    const data = allPages
      ? await getCompanyMoviesAll(parseInt(id))
      : await getCompanyMovies(parseInt(id), page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
