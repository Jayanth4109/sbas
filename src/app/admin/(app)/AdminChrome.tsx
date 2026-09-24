"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <header className="flex items-center justify-between border-b border-emerald-100 bg-white px-4 py-3">
      <span className="font-semibold text-emerald-800">SBAS Inventory</span>
      <button onClick={logout} className="text-sm text-stone-500 underline">
        Log out
      </button>
    </header>
  );
}
