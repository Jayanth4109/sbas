"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon, Leaf02Icon } from "@hugeicons/core-free-icons";
import { ProductCard as StepwiseProductCard } from "@/components/stepwise/product-card";
import { toast } from "@/components/stepwise/toast";
import type { Product } from "@/lib/types";
import { whatsappOrderLink } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";

export function ProductCard({ product, photoUrl }: { product: Product; photoUrl: string | null }) {
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({ productId: product.id, name: product.name, price: product.price, photoUrl });
    toast.success(`Added ${product.name} to cart`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[345px] flex-col items-center gap-2">
      <StepwiseProductCard
        images={photoUrl ? [photoUrl] : []}
        previewIcon={<HugeiconsIcon icon={Leaf02Icon} size={40} strokeWidth={1.3} className="text-[var(--brand-strong)]/25" />}
        name={product.name}
        description={product.description ?? undefined}
        price={product.price}
        currency="₹"
        ctaLabel="Add to cart"
        onAddToCart={handleAddToCart}
        className="w-full"
      />
      <a
        href={whatsappOrderLink(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--brand-strong)] underline decoration-[var(--brand)]/40 underline-offset-2 hover:decoration-[var(--brand)]"
      >
        <HugeiconsIcon icon={WhatsappIcon} size={13} strokeWidth={2} />
        Or order this one now on WhatsApp
      </a>
    </div>
  );
}
