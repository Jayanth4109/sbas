"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Spinner } from "@/components/stepwise/spinner";

// Matches the length of ADMIN_PIN configured for this store. Update this if
// the PIN length changes.
const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"] as const;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        return;
      }
      router.replace(searchParams.get("next") || "/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function press(key: string) {
    if (loading) return;
    setError(null);
    if (key === "back") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key || pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) submit(next);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--brand-soft)] px-6 pt-20 pb-10">
      <Surface
        radius={26}
        className="flex h-16 w-16 items-center justify-center bg-[var(--brand)] shadow-[0_8px_20px_-6px_var(--brand)]"
      >
        <Text variant="h4" className="text-white">
          SB
        </Text>
      </Surface>

      <div className="mt-6 flex flex-col items-center gap-1">
        <Text variant="h4" className="text-[var(--brand-strong)]">
          Sri Babuji Ayurvedic Stores
        </Text>
        <Text variant="caption-soft" className="text-[var(--foreground)]/50">
          Enter your PIN to manage products
        </Text>
      </div>

      <motion.div
        className="mt-10 flex gap-4"
        animate={error ? { x: [0, -8, 7, -5, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => {
          const filled = i < pin.length;
          const color = error ? "#fb7185" : "var(--brand)";
          return (
            <div
              key={i}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white"
              style={{ boxShadow: `inset 0 0 0 2px ${filled ? color : "rgb(33 28 22 / 15%)"}` }}
            >
              {filled && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.25, bounce: 0.3 }}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: color }}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      <div className="mt-6 h-5">
        {error ? (
          <Text variant="caption-soft" className="text-rose-500">
            {error}
          </Text>
        ) : loading ? (
          <Spinner size="sm" />
        ) : null}
      </div>

      <div className="mt-auto grid w-full max-w-xs grid-cols-3 gap-4 pt-10">
        {KEYS.map((key, i) =>
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={loading}
              onClick={() => press(key)}
              className="flex aspect-square items-center justify-center rounded-full text-[24px] font-medium text-[var(--foreground)] transition-colors active:bg-black/5 disabled:opacity-40"
            >
              {key === "back" ? <span aria-label="Backspace">⌫</span> : key}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
