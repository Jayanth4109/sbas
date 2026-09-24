import { createClient } from "@supabase/supabase-js";

// Anon-key client for the public storefront. Relies on RLS to only expose active products.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
