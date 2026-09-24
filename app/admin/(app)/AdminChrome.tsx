"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout03Icon } from "@hugeicons/core-free-icons";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";

export function AdminChrome() {
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js").catch(() => {});
    }
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--ui-border-subtle)] bg-white/80 px-4 py-3 backdrop-blur-md">
      <Text variant="h6" className="text-[var(--brand-strong)]">
        SBAS Inventory
      </Text>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Log out"
        icon={<HugeiconsIcon icon={Logout03Icon} size={16} strokeWidth={1.8} />}
        onClick={logout}
      />
    </header>
  );
}
