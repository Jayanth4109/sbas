import { HugeiconsIcon } from "@hugeicons/react";
import {
  Leaf02Icon,
  ShieldCheckIcon,
  WhatsappIcon,
  DeliveryTruck01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { createPublicClient } from "@/lib/supabase/public";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { Surface } from "@/components/stepwise/primitives/surface";
import { DottedGrid } from "@/components/stepwise/dotted-grid";
import { SQUIRCLE_BORDER } from "@/lib/ui";
import { STORE_ADDRESS, STORE_MAP_LINK, STORE_MAP_EMBED_SRC } from "@/lib/store";

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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[var(--brand-soft)]">
        <DottedGrid className="text-[var(--brand)]/25" size={28} dotSize={1.6} />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 sm:py-28">
          <span className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-[var(--brand-strong)] shadow-sm">
            A family pharmacy, now online
          </span>
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

      {/* ── Trust points ── */}
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

      {/* ── Owner note ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <Surface
            radius={28}
            lisse={{ middleBorder: SQUIRCLE_BORDER }}
            className="flex flex-col items-center gap-5 bg-[var(--brand-soft)] px-8 py-12 text-center"
          >
            <span className="text-[40px] leading-none text-[var(--brand)]/30">&ldquo;</span>
            {/* Placeholder note - swap in the owner's own words whenever ready. */}
            <Text variant="h6-soft" className="max-w-xl text-[var(--foreground)]/80">
              For years, our family has been part of this community&apos;s health and
              wellbeing. Every product on our shelves is one we&apos;d trust for our own
              family - because that&apos;s exactly how we choose them. We&apos;re grateful
              for your trust, and always just a message away.
            </Text>
            <Text variant="caption" className="text-[var(--brand-strong)]">
              - The family behind {storeName}
            </Text>
          </Surface>
        </div>
      </section>

      {/* ── Popular products ── */}
      {products && products.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <Text variant="h2">Popular right now</Text>
            <Button href="/products" variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ── Location ── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start gap-4">
            <Text variant="h2">Visit us in person</Text>
            <Text variant="body-soft" className="text-[var(--foreground)]/60">
              Prefer to come by? We&apos;re happy to see you at the shop too.
            </Text>
            <div className="flex items-start gap-2">
              <HugeiconsIcon
                icon={Location01Icon}
                size={18}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-[var(--brand-strong)]"
              />
              <Text variant="body-soft" className="text-[var(--foreground)]/70">
                {STORE_ADDRESS}
              </Text>
            </div>
            <Button href={STORE_MAP_LINK} target="_blank" rel="noopener noreferrer" variant="soft" size="sm">
              Get directions
            </Button>
          </div>
          <Surface radius={24} lisse={{ middleBorder: SQUIRCLE_BORDER }} className="h-72 w-full overflow-hidden sm:h-80">
            <iframe
              src={STORE_MAP_EMBED_SRC}
              title={`Map to ${storeName}`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Surface>
        </div>
      </section>

      <SiteFooter storeName={storeName} />
    </div>
  );
}
