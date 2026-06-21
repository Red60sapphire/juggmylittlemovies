import { createBrowserClient } from "@supabase/ssr";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function createClient() {
  const cookieUrl = getCookie("sb_url");
  const cookieKey = getCookie("sb_anon");
  const url = cookieUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = cookieKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key || url === "https://placeholder.supabase.co") {
    return null;
  }
  try {
    return createBrowserClient(url, key);
  } catch {
    return null;
  }
}
