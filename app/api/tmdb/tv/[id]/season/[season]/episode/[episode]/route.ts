import { NextResponse } from "next/server";

async function tmdbFetch(path: string) {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token || token === "placeholder") {
    return { error: "No token" };
  }
  try {
    const res = await fetch(`https://api.themoviedb.org/3${path}?language=en-US`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { error: "Failed to fetch" };
    return res.json();
  } catch {
    return { error: "Failed to fetch" };
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; season: string; episode: string }> }
) {
  const { id, season, episode } = await params;
  const data = await tmdbFetch(`/tv/${id}/season/${season}/episode/${episode}`);
  if (data.error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
  return NextResponse.json(data);
}