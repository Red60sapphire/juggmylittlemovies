import { NextResponse, type NextRequest } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const path = request.nextUrl.pathname;
  const method = request.method;

  const isApi = path.startsWith("/api/");
  const isAuth = path.startsWith("/api/auth/");
  const isSetup = path === "/api/setup";
  const isManga = path.startsWith("/api/manga");

  if (isApi && method !== "GET") {
    const limits: [number, number][] = [
      [isSetup ? 3 : isAuth ? 10 : isManga ? 30 : 60, isSetup ? 3600000 : 60000],
    ];
    const [max, windowMs] = limits[0];
    const ipKey = path.startsWith("/api/watch-party") ? `wp:${ip}` : isAuth ? `auth:${ip}` : `api:${ip}`;
    if (!rateLimit(ipKey, max, windowMs)) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
