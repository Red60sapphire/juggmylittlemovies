import { NextResponse } from "next/server";

export const revalidate = 10;

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const boot = await getBoot();
    const jwt = boot.sessionToken;

    const channelsRes = await fetch(
      "https://service-channels.clusters.pluto.tv/v2/guide/channels?channelIds=&offset=0&limit=1000&sort=number%3Aasc",
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!channelsRes.ok) {
      return NextResponse.json({ error: "Failed" }, { status: 502 });
    }

    const channelsData = await channelsRes.json();
    const ch = (channelsData.data || []).find(
      (c: any) => c.slug === slug && c.stitched?.path
    );

    if (!ch) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const hlsUrl = `${boot.servers.stitcher}/v2${ch.stitched.path}?${boot.stitcherParams}&jwt=${boot.sessionToken}&masterJWTPassthrough=true`;

    const findImg = (imgs: any[], type: string) =>
      imgs?.find((i: any) => i.type === type)?.url || "";

    const channel = {
      id: ch.id,
      name: ch.name,
      number: ch.number ?? 0,
      slug: ch.slug,
      category: ch.category || "General",
      summary: ch.summary || "",
      logo: findImg(ch.images, "logo") || ch.images?.[0]?.url || "",
    };

    return NextResponse.json({ channel, hlsUrl });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 502 });
  }
}
