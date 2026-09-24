import { createPublicClient } from "@/lib/supabase/public";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Text } from "@/components/stepwise/typography";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = createPublicClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-12 sm:px-8">
      <header className="mb-12 flex flex-col items-center gap-3 text-center">
        <Text variant="h1" className="text-[var(--brand-strong)]">
          {storeName}
        </Text>
        <Text variant="body-soft" className="max-w-xl text-[var(--foreground)]/65">
          Browse our medicines below. Tap &ldquo;Order&rdquo; on anything you need and
          we&apos;ll pick it up on WhatsApp to confirm and ship it to you.
        </Text>
      </header>

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              photoUrl={publicPhotoUrl(product.image_path)}
            />
          ))}
        </div>
      )}

      <footer className="mt-16 text-center">
        <Text variant="caption-soft" className="text-[var(--foreground)]/30">
          {storeName}
        </Text>
      </footer>
    </div>
  );
}
