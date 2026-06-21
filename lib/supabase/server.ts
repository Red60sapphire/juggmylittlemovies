import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const cookieUrl = cookieStore.get("sb_url")?.value;
  const cookieKey = cookieStore.get("sb_anon")?.value;
  const url = cookieUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = cookieKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key || url === "https://placeholder.supabase.co") {
    return null;
  }
  try {
    return createServerClient(url, key, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });
  } catch {
    return null;
  }
}
