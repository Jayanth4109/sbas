import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/stepwise/toast";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores",
  description: "Browse our Ayurvedic medicines and order on WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
