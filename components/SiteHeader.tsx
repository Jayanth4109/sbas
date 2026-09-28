"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon, UserIcon, Menu01Icon, PackageIcon } from "@hugeicons/core-free-icons";
import { Text } from "@/components/stepwise/typography";
import { Avatar } from "@/components/stepwise/avatar";
import { Drawer } from "@/components/stepwise/drawer";
import { useCart } from "@/lib/cart";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SiteHeader({ storeName, overlay = false }: { storeName: string; overlay?: boolean }) {
  const { count } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const displayName = user?.user_metadata?.full_name || user?.email || "Account";
  const solid = !overlay || scrolled;

  return (
    <>
      <header
        className={`z-20 transition-colors duration-300 ${
          overlay ? "fixed inset-x-0 top-0" : "sticky top-0"
        } ${
          solid
            ? "border-b border-[var(--ui-border-subtle)] bg-[var(--background)]/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
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

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Cart"
            >
              <HugeiconsIcon icon={ShoppingCart01Icon} size={20} strokeWidth={1.8} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Open menu"
            >
              <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="bottom" height="auto" ariaLabel="Menu">
        <div className="flex flex-col gap-1">
          <Link
            href="/products"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-black/5"
          >
            <HugeiconsIcon icon={PackageIcon} size={19} strokeWidth={1.8} className="text-[var(--brand-strong)]" />
            <Text variant="body-soft">All products</Text>
          </Link>

          {user ? (
            <Link
              href="/account/orders"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-black/5"
            >
              <Avatar name={displayName} variant="letter" size="sm" showTooltip={false} />
              <Text variant="body-soft">Your orders</Text>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-black/5"
            >
              <HugeiconsIcon icon={UserIcon} size={19} strokeWidth={1.8} className="text-[var(--brand-strong)]" />
              <Text variant="body-soft">Sign in</Text>
            </Link>
          )}
        </div>
      </Drawer>
    </>
  );
}
