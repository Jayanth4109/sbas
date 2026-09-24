"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/stepwise/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={signOut}>
      Sign out
    </Button>
  );
}
