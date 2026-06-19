import { NextResponse } from "next/server";

export const revalidate = 10;

interface PlutoChannel {
  id: string;
  name: string;
  number: number;
  slug: string;
  category: string;
  summary: string;
  logo: string;
}

let bootCache: { data: any; expiresAt: number } | null = null;

async function getBoot() {
  if (bootCache && Date.now() < bootCache.expiresAt) {
    return bootCache.data;
  }

  const clientId = crypto.randomUUID();
  const clientTime = new Date().toISOString();
  const bootUrl = `https://boot.pluto.tv/v4/start?appName=web&appVersion=7.9.0-a9cca6b89aea4dc0998b92a51989d2adb9a9025d&deviceVersion=16.2.0&deviceModel=web&deviceMake=Chrome&deviceType=web&clientID=${clientId}&clientModelNumber=1.0.0&channelID=5a4d3a00ad95e4718ae8d8db&serverSideAds=true&constraints=&drmCapabilities=&blockingMode=&clientTime=${encodeURIComponent(clientTime)}`;

  const res = await fetch(bootUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) throw new Error("Boot failed");

  const data = await res.json();
  bootCache = { data, expiresAt: Date.now() + 1800000 };
  return data;
}

export async function GET() {
  try {
    const boot = await getBoot();
    const jwt = boot.sessionToken;

    const [channelsRes, categoriesRes] = await Promise.all([
      fetch(
        "https://service-channels.clusters.pluto.tv/v2/guide/channels?channelIds=&offset=0&limit=1000&sort=number%3Aasc",
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "User-Agent": "Mozilla/5.0",
          },
        }
      ),
      fetch(
        "https://service-channels.clusters.pluto.tv/v2/guide/categories",
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "User-Agent": "Mozilla/5.0",
          },
        }
      ),
    ]);

    if (!channelsRes.ok || !categoriesRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch channels" },
        { status: 502 }
      );
    }

    const channelsData = await channelsRes.json();
    const categoriesData = await categoriesRes.json();

    const catMap = new Map(
      (categoriesData.data || []).map((c: any) => [c.id, c.name])
    );

    const findImg = (imgs: any[], type: string) =>
      imgs?.find((i: any) => i.type === type)?.url || "";

    const CATEGORY_ORDER: Record<string, number> = {
      "Sports": 0,
      "News": 1,
      "Entertainment": 2,
      "Movies": 3,
      "Comedy": 4,
      "Reality": 5,
      "Kids": 6,
      "Lifestyle": 7,
      "Music": 8,
    };

    const CHANNEL_PRIORITY: Record<string, number> = {
      "ESPN": 0, "ESPN2": 1, "Fox Sports": 2, "Fox Sports 2": 3,
      "CNN": 0, "Fox News": 1, "MSNBC": 2, "CNBC": 3, "Bloomberg": 4,
      "AMC": 0, "FX": 1, "TNT": 2, "USA Network": 3, "TBS": 4,
    };

    const channels: PlutoChannel[] = (channelsData.data || [])
      .filter((ch: any) => ch.stitched?.path)
      .map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        number: ch.number ?? 0,
        slug: ch.slug,
        category: catMap.get(ch.categoryIDs?.[0]) || "General",
        summary: ch.summary || "",
        logo: findImg(ch.images, "logo") || ch.images?.[0]?.url || "",
      }))
      .sort((a: PlutoChannel, b: PlutoChannel) => {
        const catA = CATEGORY_ORDER[a.category] ?? 99;
        const catB = CATEGORY_ORDER[b.category] ?? 99;
        if (catA !== catB) return catA - catB;
        const prioA = CHANNEL_PRIORITY[a.name] ?? 999;
        const prioB = CHANNEL_PRIORITY[b.name] ?? 999;
        if (prioA !== prioB) return prioA - prioB;
        return a.number - b.number;
      });

    const categories = [
      ...new Set(channels.map((c) => c.category)),
    ].sort();

    return NextResponse.json({ channels, categories });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 502 }
    );
  }
}
