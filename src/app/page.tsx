import { createPublicClient } from "@/lib/supabase/public";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

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
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
      <header className="mb-8 flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold text-emerald-800 sm:text-4xl">{storeName}</h1>
        <p className="max-w-xl text-stone-600">
          Browse our medicines below. To order, tap &ldquo;Order on WhatsApp&rdquo; on any
          product &mdash; we&apos;ll confirm and get it shipped to you.
        </p>
      </header>

      {!products || products.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-stone-500">
          Products coming soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              photoUrl={publicPhotoUrl(product.image_path)}
            />
          ))}
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-stone-400">{storeName}</footer>
    </div>
  );
}
