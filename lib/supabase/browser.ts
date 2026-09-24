import { createBrowserClient } from "@supabase/ssr";

// Cookie-aware client for use in Client Components: reads/writes the same
// session cookies the server-side clients read, so sign-in state is shared.
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
