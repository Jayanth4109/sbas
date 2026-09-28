import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Leaf02Icon,
  WhatsappIcon,
  Store01Icon,
  ArrowRight02Icon,
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
import { SQUIRCLE_BORDER } from "@/lib/ui";
import { STORE_ADDRESS, STORE_MAP_LINK, STORE_MAP_EMBED_SRC } from "@/lib/store";

export const revalidate = 30;

// Small custom "illustration": a soft brand-tinted blob behind a large icon.
// No stock art, no photos - just shape + icon, themed to the brand palette.
function IconArt({ icon, className }: { icon: typeof Leaf02Icon; className?: string }) {
  return (
    <div className={`relative flex h-24 w-24 shrink-0 items-center justify-center ${className ?? ""}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-[var(--brand)]">
        <path
          d="M50 6c22 0 41 12 46 32 5 20-6 44-28 52-24 9-50-2-58-24S2 26 22 12C30 6 40 6 50 6Z"
          fill="currentColor"
          opacity="0.14"
        />
      </svg>
      <HugeiconsIcon icon={icon} size={40} strokeWidth={1.4} className="relative text-[var(--brand-strong)]" />
    </div>
  );
}

export default async function LandingPage() {
  const supabase = createPublicClient();
  const { data: allProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(250)
    .returns<Product[]>();

  const products = allProducts ?? [];
  const popular = products.slice(0, 3);

  const byCategory = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.category?.trim();
    if (!key) continue;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  }
  const categorySections = Array.from(byCategory.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader storeName={storeName} overlay />

      {/* ── Hero, full viewport ── */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#f2ead9] pb-6 sm:pb-10">
        {/* Art-directed: two different crops, not one image resized - the
            mobile version is a tall portrait, desktop a short landscape,
            each keeping the decorative leaves framed and the centre clear
            for text. */}
        <Image
          src="/hero/hero-mobile.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:hidden"
        />
        <Image
          src="/hero/hero-desktop.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover sm:block"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-5 text-center sm:px-8">
          <Text
            variant="caption"
            className="mt-6 uppercase tracking-[0.2em] text-[var(--brand-strong)]/70 sm:mt-10"
          >
            {storeName}
          </Text>
          <Text variant="hero" className="max-w-2xl font-bold text-[var(--foreground)]">
            Your neighbourhood
            <br />
            Ayurvedic pharmacy,
            <br />
            <span className="text-[var(--brand-strong)]">now online.</span>
          </Text>
          <Text variant="body" className="max-w-md text-[var(--foreground)]/70">
            Genuine Ayurvedic medicines, sourced with care - easy to browse before you order.
          </Text>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              href="/products"
              size="lg"
              icon={<HugeiconsIcon icon={ArrowRight02Icon} size={17} strokeWidth={2.2} />}
              iconPosition="right"
              className="bg-gradient-to-b from-[var(--brand)] to-[var(--brand-strong)]"
            >
              Browse medicines
            </Button>
          </div>
        </div>

        {/* Soft fade into the section below. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ── Trust points, bento layout ── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-16 sm:px-8 md:grid-cols-2">
          <Surface
            radius={24}
            lisse={{ middleBorder: SQUIRCLE_BORDER }}
            className="flex flex-col items-start gap-4 bg-[var(--brand-soft)] p-7"
          >
            <IconArt icon={Leaf02Icon} />
            <div className="flex flex-col items-start gap-1 text-left">
              <Text variant="h5-soft">Genuine Ayurvedic medicines</Text>
              <Text variant="body-soft" className="text-[var(--foreground)]/60">
                Every product on our shelf, sourced and stocked the way we always have.
              </Text>
            </div>
          </Surface>

          <Surface
            radius={24}
            lisse={{ middleBorder: SQUIRCLE_BORDER }}
            className="flex flex-col items-start gap-4 bg-[#eef6f0] p-7"
          >
            <IconArt icon={WhatsappIcon} />
            <div className="flex flex-col items-start gap-1 text-left">
              <Text variant="h5-soft">Order on WhatsApp</Text>
              <Text variant="body-soft" className="text-[var(--foreground)]/60">
                Send your order and we&apos;ll confirm it with you personally.
              </Text>
            </div>
          </Surface>

          <Surface
            radius={24}
            lisse={{ middleBorder: { width: 1, opacity: 1, color: "rgb(255 255 255 / 10%)" } }}
            className="flex flex-col items-start gap-4 bg-[var(--brand-strong)] p-7 text-white md:col-span-2 md:flex-row md:items-center"
          >
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-white">
                <path
                  d="M50 6c22 0 41 12 46 32 5 20-6 44-28 52-24 9-50-2-58-24S2 26 22 12C30 6 40 6 50 6Z"
                  fill="currentColor"
                  opacity="0.12"
                />
              </svg>
              <HugeiconsIcon icon={Store01Icon} size={40} strokeWidth={1.4} className="relative text-white" />
            </div>
            <div className="flex flex-col items-start gap-1 text-left">
              <Text variant="h5-soft" className="text-white">
                A pharmacy you already trust
              </Text>
              <Text variant="body-soft" className="text-white/65">
                We stand behind everything we sell.
              </Text>
            </div>
          </Surface>
        </div>
      </section>

      {/* ── Popular products ── */}
      {popular.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Text variant="h2">Popular right now</Text>
              <Text variant="body-soft" className="text-[var(--foreground)]/55">
                A few of our most-ordered medicines, picked for you.
              </Text>
            </div>
            <Button
              href="/products"
              variant="ghost"
              size="sm"
              icon={<HugeiconsIcon icon={ArrowRight02Icon} size={14} strokeWidth={2.2} />}
              iconPosition="right"
              className="shrink-0"
            >
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                photoUrl={publicPhotoUrl(product.image_path)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Category rows, once products are tagged with one ── */}
      {categorySections.map(([category, items]) => (
        <section key={category} className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Text variant="h2">{category}</Text>
              <Text variant="body-soft" className="text-[var(--foreground)]/55">
                A few of our {category.toLowerCase()} picks, ready to order.
              </Text>
            </div>
            <Button
              href={`/products?category=${encodeURIComponent(category)}`}
              variant="ghost"
              size="sm"
              icon={<HugeiconsIcon icon={ArrowRight02Icon} size={14} strokeWidth={2.2} />}
              iconPosition="right"
              className="shrink-0"
            >
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                photoUrl={publicPhotoUrl(product.image_path)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* ── Browse everything ── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <Surface
          radius={28}
          lisse={{ middleBorder: SQUIRCLE_BORDER }}
          className="flex flex-col items-center gap-4 bg-[var(--brand-soft)] px-6 py-12 text-center"
        >
          <Text variant="h2">Looking for something else?</Text>
          <Text variant="body-soft" className="max-w-md text-[var(--foreground)]/60">
            Browse our full catalogue of Ayurvedic medicines, oils, and wellness essentials.
          </Text>
          <Button
            href="/products"
            size="lg"
            icon={<HugeiconsIcon icon={ArrowRight02Icon} size={17} strokeWidth={2.2} />}
            iconPosition="right"
            className="bg-gradient-to-b from-[var(--brand)] to-[var(--brand-strong)]"
          >
            View all products
          </Button>
        </Surface>
      </section>

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
