"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon, ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { toast } from "@/components/stepwise/toast";
import type { Product } from "@/lib/types";
import { whatsappOrderLink } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";
import { SQUIRCLE_BORDER } from "@/lib/ui";

export function ProductCard({ product, photoUrl }: { product: Product; photoUrl: string | null }) {
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({ productId: product.id, name: product.name, price: product.price, photoUrl });
    toast.success(`Added ${product.name} to cart`);
  }

  return (
    <Surface
      radius={24}
      lisse={{ middleBorder: SQUIRCLE_BORDER }}
      className="flex h-full flex-col overflow-hidden bg-white shadow-[0_1px_2px_rgb(33_28_22_/_4%),0_8px_24px_-12px_rgb(33_28_22_/_12%)]"
    >
      <div className="relative aspect-square w-full bg-brand-soft">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Text variant="caption-soft" className="text-[var(--brand-strong)]/50">
              No photo yet
            </Text>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <Text variant="h6" className="text-[var(--foreground)]">
            {product.name}
          </Text>
          {product.description && (
            <Text variant="caption-soft" className="line-clamp-2 text-[var(--foreground)]/60">
              {product.description}
            </Text>
          )}
        </div>

        <Text variant="h5-soft" className="mt-auto text-[var(--brand-strong)]">
          ₹{product.price}
        </Text>

        <div className="flex gap-2">
          <Button
            variant="soft"
            size="sm"
            fullWidth
            icon={<HugeiconsIcon icon={ShoppingCart01Icon} size={15} strokeWidth={1.8} />}
            onClick={handleAddToCart}
          >
            Add to cart
          </Button>
          <Button
            href={whatsappOrderLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            iconOnly
            aria-label="Order this item now on WhatsApp"
            icon={<HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={2} />}
            className="bg-gradient-to-b from-[var(--brand)] to-[var(--brand-strong)]"
          />
        </div>
      </div>
    </Surface>
  );
}
