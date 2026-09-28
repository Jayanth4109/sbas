"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon, UserIcon, Menu01Icon, PackageIcon } from "@hugeicons/core-free-icons";
import { Text } from "@/components/stepwise/typography";
import { DropdownMenu } from "@/components/stepwise/dropdown-menu";
import { useCart } from "@/lib/cart";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SiteHeader({ storeName, overlay = false }: { storeName: string; overlay?: boolean }) {
  const router = useRouter();
  const { count } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!overlay) return;
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const solid = !overlay || scrolled;

  return (
    <header
      className={`z-20 transition-colors duration-300 ${overlay ? "fixed inset-x-0 top-0" : "sticky top-0"} ${
        solid ? "bg-[var(--background)]/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-[13px] font-semibold text-white">
            SB
          </span>
          <Text
            variant="h6"
            className={`hidden sm:block ${solid ? "text-[var(--brand-strong)]" : "text-[var(--foreground)]"}`}
          >
            {storeName}
          </Text>
        </Link>

        {/* Glassy floating pill - cart + menu, always visually separated from
            the page behind it rather than a full-width bar. */}
        <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/30 p-1 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.15)] backdrop-blur-md">
          <Link
            href="/cart"
            className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="Cart"
          >
            <HugeiconsIcon icon={ShoppingCart01Icon} size={18} strokeWidth={1.8} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          <DropdownMenu
            align="end"
            trigger={
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Open menu"
              >
                <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.8} />
              </button>
            }
            items={[
              {
                label: "All products",
                icon: <HugeiconsIcon icon={PackageIcon} size={16} strokeWidth={1.8} />,
                onSelect: () => router.push("/products"),
              },
              user
                ? {
                    label: "Your orders",
                    icon: <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.8} />,
                    onSelect: () => router.push("/account/orders"),
                  }
                : {
                    label: "Sign in",
                    icon: <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.8} />,
                    onSelect: () => router.push("/sign-in"),
                  },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
