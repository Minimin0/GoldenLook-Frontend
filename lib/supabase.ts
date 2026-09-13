import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 브라우저 전용 Supabase client.
 * anon key 와 URL 만 둔다. Service Role / Gemini key 는 Backend 에만 있어야 한다.
 * (기획서 12. 보안·안전 / AGENTS.md Secret)
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 가 필요합니다. .env.example 을 확인해 주세요.",
    );
  }
  client ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}
