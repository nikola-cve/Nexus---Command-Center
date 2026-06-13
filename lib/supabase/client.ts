import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (anon/publishable key, safe to expose). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
