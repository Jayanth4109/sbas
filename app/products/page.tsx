import { createPublicClient } from "@/lib/supabase/public";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Text } from "@/components/stepwise/typography";
import { ProductsBrowser } from "./ProductsBrowser";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; p?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const category = (sp.category ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.p ?? "1", 10) || 1);

  const supabase = createPublicClient();

  let query = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true);
  if (category) query = query.eq("category", category);
  if (q) {
    // strip characters that would break out of the PostgREST or() filter
    const safe = q.replace(/[,()%*\\]/g, " ");
    query = query.or(`name.ilike.%${safe}%,category.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  const from = (page - 1) * PAGE_SIZE;
  const { data: products, count } = await query
    .order("name", { ascending: true })
    .range(from, from + PAGE_SIZE - 1)
    .returns<Product[]>();

  // The API returns at most 1000 rows per request, so read the category column in pages.
  const categorySet = new Set<string>();
  for (let start = 0; start < 20000; start += 1000) {
    const { data } = await supabase
      .from("products")
      .select("category")
      .eq("is_active", true)
      .not("category", "is", null)
      .range(start, start + 999);
    for (const row of data ?? []) if (row.category?.trim()) categorySet.add(row.category.trim());
    if (!data || data.length < 1000) break;
  }
  const categories = Array.from(categorySet).sort();

  const photoUrls = Object.fromEntries((products ?? []).map((p) => [p.id, publicPhotoUrl(p.image_path)]));
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";
  const anyLive = (count ?? 0) > 0 || Boolean(q) || Boolean(category);

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

        {!anyLive ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
            <Text variant="h5-soft" className="text-[var(--foreground)]/50">
              Products coming soon
            </Text>
            <Text variant="caption-soft" className="text-[var(--foreground)]/35">
              We&apos;re adding our catalogue - check back shortly.
            </Text>
          </div>
        ) : (
          <ProductsBrowser
            products={products ?? []}
            photoUrls={photoUrls}
            categories={categories}
            total={count ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            query={q}
            category={category}
          />
        )}
      </div>

      <SiteFooter storeName={storeName} />
    </div>
  );
}
