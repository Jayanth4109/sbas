import type { Metadata } from "next";
import { AdminChrome } from "./AdminChrome";

export const metadata: Metadata = {
  title: "SBAS Inventory",
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: { capable: true, title: "SBAS Inventory", statusBarStyle: "default" },
};

export const viewport = { themeColor: "#2f6b4f" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminChrome />
      {/* Extra bottom padding beyond safe-area-inset-bottom: several mobile
          browsers (Arc, etc.) keep a persistent bottom toolbar that isn't
          reported through that env var at all, and can otherwise cover the
          last element on the page. */}
      <main className="mx-auto max-w-2xl px-4 pt-6 pb-24">{children}</main>
    </div>
  );
}
