import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Match {
  id: string;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute: number | null;
  kickoffTs: number;
  group: string;
  venue: string;
  city: string;
}

function normalizeStatus(m: Match): Match {
  const now = Date.now() / 1000;
  if (m.status === "live") return m;
  if (m.status === "scheduled" && m.kickoffTs && m.kickoffTs <= now + 300) {
    return { ...m, status: "live", minute: Math.max(0, Math.floor((now - m.kickoffTs) / 60)) };
  }
  return m;
}

export async function GET() {
  try {
    const res = await fetch("https://fifaworldcup.cfd/api/matches", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const all: Match[] = data.matches || [];
    const normalized = all.map(normalizeStatus);
    const live = normalized.filter((m) => m.status === "live");
    const scheduled = normalized.filter((m) => m.status === "scheduled");
    return NextResponse.json({
      live,
      scheduled,
      streamUrl: "https://fifaworldcup.cfd/api/stream",
      counts: data.counts,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch World Cup data" }, { status: 502 });
  }
}
