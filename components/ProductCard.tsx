import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import type { Product } from "@/lib/types";
import { whatsappOrderLink } from "@/lib/whatsapp";
import { SQUIRCLE_BORDER } from "@/lib/ui";

export function ProductCard({ product, photoUrl }: { product: Product; photoUrl: string | null }) {
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

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <Text variant="h5-soft" className="text-[var(--brand-strong)]">
            ₹{product.price}
          </Text>
          <Button
            href={whatsappOrderLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="solid"
            icon={<HugeiconsIcon icon={WhatsappIcon} size={15} strokeWidth={2} />}
            className="bg-gradient-to-b from-[var(--brand)] to-[var(--brand-strong)] dark:from-[var(--brand)] dark:to-[var(--brand-strong)]"
          >
            Order
          </Button>
        </div>
      </div>
    </Surface>
  );
}
