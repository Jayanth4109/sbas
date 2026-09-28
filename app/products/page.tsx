import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Text } from "@/components/stepwise/typography";
import { ProductsBrowser } from "./ProductsBrowser";

export const revalidate = 30;

export default async function ProductsPage() {
  const supabase = createPublicClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  const photoUrls = Object.fromEntries(
    (products ?? []).map((p) => [p.id, publicPhotoUrl(p.image_path)]),
  );

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader storeName={storeName} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-col gap-1">
          <Text variant="h2">All products</Text>
          <Text variant="body-soft" className="text-[var(--foreground)]/55">
            Add what you need to your cart, or order a single item straight away.
          </Text>
        </div>

        {!products || products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
            <Text variant="h5-soft" className="text-[var(--foreground)]/50">
              Products coming soon
            </Text>
            <Text variant="caption-soft" className="text-[var(--foreground)]/35">
              We&apos;re adding our catalogue - check back shortly.
            </Text>
          </div>
        ) : (
          <Suspense fallback={null}>
            <ProductsBrowser products={products} photoUrls={photoUrls} />
          </Suspense>
        )}
      </div>

      <SiteFooter storeName={storeName} />
    </div>
  );
}
