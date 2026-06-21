import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createAdminClient() {
  const cookieStore = await cookies();
  const cookieUrl = cookieStore.get("sb_url")?.value;
  const cookieService = cookieStore.get("sb_service")?.value;
  const url = cookieUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = cookieService || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey || url === "https://placeholder.supabase.co") return null;
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function isSupabaseConfigured() {
  const cookieStore = await cookies();
  const cookieUrl = cookieStore.get("sb_url")?.value;
  const cookieAnon = cookieStore.get("sb_anon")?.value;
  const cookieService = cookieStore.get("sb_service")?.value;
  const url = cookieUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = cookieAnon || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = cookieService || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return Boolean(url && anon && service && url !== "https://placeholder.supabase.co");
}
