import { HugeiconsIcon } from "@hugeicons/react";
import { Leaf02Icon, ShieldCheckIcon, WhatsappIcon, DeliveryTruck01Icon } from "@hugeicons/core-free-icons";
import { createPublicClient } from "@/lib/supabase/public";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";

export const revalidate = 30;

const TRUST_POINTS = [
  {
    icon: Leaf02Icon,
    title: "Genuine Ayurvedic medicines",
    body: "Every product on our shelf, sourced and stocked the way we always have.",
  },
  {
    icon: WhatsappIcon,
    title: "Order on WhatsApp",
    body: "Send your order and we'll confirm it with you personally, no waiting around.",
  },
  {
    icon: DeliveryTruck01Icon,
    title: "Shipped to your door",
    body: "Once confirmed, we get it packed and sent out via trusted local courier.",
  },
  {
    icon: ShieldCheckIcon,
    title: "A pharmacy you already trust",
    body: "Same family, same shop, now easier to browse from home.",
  },
];

export default async function LandingPage() {
  const supabase = createPublicClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<Product[]>();

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader storeName={storeName} />

      <section className="bg-[var(--brand-soft)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 sm:py-28">
          <Text variant="hero" className="max-w-2xl text-[var(--brand-strong)]">
            {storeName}
          </Text>
          <Text variant="body-soft" className="max-w-xl text-[var(--foreground)]/65">
            Trusted Ayurvedic medicines for your family, now just as easy to browse online as
            it is to walk into our shop.
          </Text>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button href="/products" size="lg">
              Browse products
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-[var(--brand-strong)]">
                <HugeiconsIcon icon={point.icon} size={22} strokeWidth={1.6} />
              </span>
              <Text variant="h6-soft">{point.title}</Text>
              <Text variant="caption-soft" className="text-[var(--foreground)]/55">
                {point.body}
              </Text>
            </div>
          ))}
        </div>
      </section>

      {products && products.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <Text variant="h2">Popular right now</Text>
            <Button href="/products" variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                photoUrl={publicPhotoUrl(product.image_path)}
              />
            ))}
          </div>
        </section>
      )}

      <SiteFooter storeName={storeName} />
    </div>
  );
}
