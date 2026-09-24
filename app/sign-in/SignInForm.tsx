"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.97v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.97A9 9 0 0 0 0 9c0 1.45.35 2.83.97 4.03l2.98-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .97 4.97l2.98 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const next = searchParams.get("next") || "/account/orders";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader storeName={STORE_NAME} />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-5 py-20 text-center">
        <Text variant="h3" className="text-[var(--brand-strong)]">
          Sign in
        </Text>
        <Text variant="body-soft" className="text-[var(--foreground)]/55">
          Sign in to see your past orders from {STORE_NAME}.
        </Text>
        {searchParams.get("error") && (
          <Text variant="caption-soft" className="text-rose-500">
            Something went wrong signing you in. Please try again.
          </Text>
        )}
        <Button
          fullWidth
          size="lg"
          variant="outline"
          loading={loading}
          icon={<GoogleLogo />}
          onClick={signInWithGoogle}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
