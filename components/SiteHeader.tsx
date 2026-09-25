"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Text } from "@/components/stepwise/typography";
import { Avatar } from "@/components/stepwise/avatar";
import { useCart } from "@/lib/cart";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SiteHeader({ storeName }: { storeName: string }) {
  const { count } = useCart();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email || "Account";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--ui-border-subtle)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-[13px] font-semibold text-white">
            SB
          </span>
          <Text variant="h6" className="hidden text-[var(--brand-strong)] sm:block">
            {storeName}
          </Text>
        </Link>

        <nav className="flex items-center gap-5">
          <Link href="/products">
            <Text variant="body-soft" className="text-[var(--foreground)]/70 hover:text-[var(--foreground)]">
              Products
            </Text>
          </Link>
          <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
            <HugeiconsIcon icon={ShoppingCart01Icon} size={20} strokeWidth={1.8} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link href="/account/orders" aria-label="Your orders">
              <Avatar name={displayName} variant="letter" size="sm" showTooltip={false} />
            </Link>
          ) : (
            <Link href="/sign-in" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5" aria-label="Sign in">
              <HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.8} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
