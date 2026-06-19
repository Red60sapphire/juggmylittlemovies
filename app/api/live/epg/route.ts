import { NextResponse } from "next/server";

export const revalidate = 10;
export const dynamic = "force-dynamic";

interface TimelineEntry {
  start: string;
  stop: string;
  title: string;
  _id: string;
  episode?: {
    _id: string;
    name: string;
    rating: string;
    originalContentDuration: number;
    genre: string;
    description: string;
    slug: string;
    series: string;
  };
}

interface EPGChannel {
  id: string;
  name: string;
  number: number;
  slug: string;
  category: string;
  summary: string;
  logo: string;
  timelines: TimelineEntry[];
}

const CATEGORY_ORDER: Record<string, number> = {
  "Sports": 0, "News": 1, "Entertainment": 2, "Movies": 3,
  "Comedy": 4, "Reality": 5, "Kids": 6, "Lifestyle": 7, "Music": 8,
};

const CHANNEL_PRIORITY: Record<string, number> = {
  "ESPN": 0, "ESPN2": 1, "Fox Sports": 2, "Fox Sports 2": 3,
  "CNN": 0, "Fox News": 1, "MSNBC": 2, "CNBC": 3, "Bloomberg": 4,
  "AMC": 0, "FX": 1, "TNT": 2, "USA Network": 3, "TBS": 4,
};

const EPG_BATCH_LIMIT = 80;

function sortChannels(channels: any[]) {
  return [...channels].sort((a: any, b: any) => {
    const catA = CATEGORY_ORDER[a.category] ?? 99;
    const catB = CATEGORY_ORDER[b.category] ?? 99;
    if (catA !== catB) return catA - catB;
    const prioA = CHANNEL_PRIORITY[a.name] ?? 999;
    const prioB = CHANNEL_PRIORITY[b.name] ?? 999;
    if (prioA !== prioB) return prioA - prioB;
    return a.number - b.number;
  });
}

function generatePlaceholderTimelines(ch: any, now: Date): TimelineEntry[] {
  const titles = ["Live Programming", `${ch.name} Presents`, "Featured Content", "Up Next", "Original Series", "Special Event"];
  const results: TimelineEntry[] = [];
  for (let i = -2; i < 4; i++) {
    const start = new Date(now.getTime() + i * 3600000);
    const stop = new Date(start.getTime() + 3600000);
    results.push({
      start: start.toISOString(),
      stop: stop.toISOString(),
      title: titles[Math.abs(i) % titles.length],
      _id: `${ch.id}-pl-${i}`,
      episode: ch.summary ? {
        _id: "", name: "", rating: "", originalContentDuration: 3600000,
        genre: ch.category, description: ch.summary, slug: "", series: "",
      } : undefined,
    });
  }
  return results;
}

let bootCache: { data: any; expiresAt: number } | null = null;
let channelsCache: { data: any[]; expiresAt: number } | null = null;
let epgCache: { data: EPGChannel[]; expiresAt: number } | null = null;

async function getBoot() {
  if (bootCache && Date.now() < bootCache.expiresAt) return bootCache.data;
  const clientId = crypto.randomUUID();
  const clientTime = new Date().toISOString();
  const bootUrl = `https://boot.pluto.tv/v4/start?appName=web&appVersion=7.9.0-a9cca6b89aea4dc0998b92a51989d2adb9a9025d&deviceVersion=16.2.0&deviceModel=web&deviceMake=Chrome&deviceType=web&clientID=${clientId}&clientModelNumber=1.0.0&channelID=5a4d3a00ad95e4718ae8d8db&serverSideAds=true&constraints=&drmCapabilities=&blockingMode=&clientTime=${encodeURIComponent(clientTime)}`;
  const res = await fetch(bootUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error("Boot failed");
  const data = await res.json();
  bootCache = { data, expiresAt: Date.now() + 1800000 };
  return data;
}

async function getChannels(): Promise<any[]> {
  if (channelsCache && Date.now() < channelsCache.expiresAt) return channelsCache.data;
  const boot = await getBoot();
  const jwt = boot.sessionToken;
  const [channelsRes, categoriesRes] = await Promise.all([
    fetch("https://service-channels.clusters.pluto.tv/v2/guide/channels?channelIds=&offset=0&limit=1000&sort=number%3Aasc", {
      headers: { Authorization: `Bearer ${jwt}`, "User-Agent": "Mozilla/5.0" },
    }),
    fetch("https://service-channels.clusters.pluto.tv/v2/guide/categories", {
      headers: { Authorization: `Bearer ${jwt}`, "User-Agent": "Mozilla/5.0" },
    }),
  ]);
  if (!channelsRes.ok) throw new Error("Failed to fetch channels");
  const channelsData = await channelsRes.json();
  const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };
  const catMap = new Map((categoriesData.data || []).map((c: any) => [c.id, c.name]));
  const findImg = (imgs: any[], type: string) => imgs?.find((i: any) => i.type === type)?.url || "";
  const channels = (channelsData.data || [])
    .filter((ch: any) => ch.stitched?.path)
    .map((ch: any) => ({
      id: ch.id, name: ch.name, number: ch.number ?? 0, slug: ch.slug,
      category: catMap.get(ch.categoryIDs?.[0]) || "General",
      summary: ch.summary || "",
      logo: findImg(ch.images, "logo") || ch.images?.[0]?.url || "",
    }));
  channelsCache = { data: channels, expiresAt: Date.now() + 600000 };
  return channels;
}

export async function GET() {
  try {
    if (epgCache && Date.now() < epgCache.expiresAt) {
      return NextResponse.json({ channels: epgCache.data });
    }

    const boot = await getBoot();
    const jwt = boot.sessionToken;
    const channels = await getChannels();
    const now = new Date();
    const sorted = sortChannels(channels);
    const topChannels = sorted.slice(0, EPG_BATCH_LIMIT);
    const restChannels = sorted.slice(EPG_BATCH_LIMIT);
    const CONCURRENCY = 15;

    const fetchTimelines = async (channelId: string): Promise<TimelineEntry[]> => {
      const cId = crypto.randomUUID();
      const cTime = new Date().toISOString();
      const url = `https://boot.pluto.tv/v4/start?appName=web&appVersion=7.9.0-a9cca6b89aea4dc0998b92a51989d2adb9a9025d&deviceVersion=16.2.0&deviceModel=web&deviceMake=Chrome&deviceType=web&clientID=${cId}&clientModelNumber=1.0.0&channelID=${channelId}&serverSideAds=true&clientTime=${encodeURIComponent(cTime)}`;
      try {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
        if (!res.ok) return [];
        const data = await res.json();
        const epgEntry = (data.EPG || []).find((e: any) => e.id === channelId);
        return epgEntry?.timelines || [];
      } catch {
        return [];
      }
    };

    const epgResults: EPGChannel[] = [];
    for (let i = 0; i < topChannels.length; i += CONCURRENCY) {
      const batch = topChannels.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (ch) => {
          const timelines = await fetchTimelines(ch.id);
          return { ...ch, timelines } as EPGChannel;
        })
      );
      epgResults.push(...batchResults);
    }

    for (const ch of restChannels) {
      epgResults.push({ ...ch, timelines: generatePlaceholderTimelines(ch, now) } as EPGChannel);
    }

    epgCache = { data: epgResults, expiresAt: Date.now() + 600000 };
    return NextResponse.json({ channels: epgResults });
  } catch {
    return NextResponse.json({ error: "Failed to fetch EPG" }, { status: 502 });
  }
}
