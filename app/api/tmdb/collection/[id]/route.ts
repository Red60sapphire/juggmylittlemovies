import { NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token || token === "placeholder") {
    return NextResponse.json({ name: "", parts: [] });
  }

  try {
    const res = await fetch(`${TMDB_BASE}/collection/${id}?language=en-US`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 7200 },
    });
    if (!res.ok) return NextResponse.json({ name: "", parts: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ name: "", parts: [] });
  }
}
