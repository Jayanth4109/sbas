"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { OtpInput } from "@/components/stepwise/otp-input";

// Matches the length of ADMIN_PIN configured for this store. Update this if
// the PIN length changes.
const PIN_LENGTH = 4;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Bumped only to force OtpInput to reset its internal focus after a wrong
  // PIN - never on every keystroke, which would fight the user's typing.
  const [resetKey, setResetKey] = useState(0);

  async function submit(code: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong");
        setPin("");
        setResetKey((k) => k + 1);
        return;
      }
      router.replace(searchParams.get("next") || "/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[var(--brand-soft)] px-4">
      <div className="flex flex-col items-center gap-1">
        <Text variant="h3" className="text-[var(--brand-strong)]">
          Sri Babuji Ayurvedic Stores
        </Text>
        <Text variant="caption-soft" className="text-[var(--foreground)]/50">
          Enter your PIN to manage products
        </Text>
      </div>

      <Surface
        radius={28}
        className="flex w-full max-w-xs flex-col items-center gap-6 border border-[var(--ui-border)] bg-white px-6 py-10 shadow-[0_1px_2px_rgb(33_28_22_/_4%),0_16px_40px_-16px_rgb(33_28_22_/_16%)]"
      >
        <OtpInput
          key={resetKey}
          length={PIN_LENGTH}
          value={pin}
          onChange={setPin}
          onComplete={submit}
          error={!!error}
          disabled={loading}
        />

        {error && (
          <Text variant="caption-soft" className="text-center text-rose-500">
            {error}
          </Text>
        )}

        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={pin.length < PIN_LENGTH}
          onClick={() => submit(pin)}
        >
          Enter
        </Button>
      </Surface>
    </div>
  );
}
