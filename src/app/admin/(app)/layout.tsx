import type { Metadata } from "next";
import { AdminChrome } from "./AdminChrome";

export const metadata: Metadata = {
  title: "SBAS Inventory",
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: { capable: true, title: "SBAS Inventory", statusBarStyle: "default" },
};

export const viewport = { themeColor: "#047857" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-emerald-50/40">
      <AdminChrome />
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
