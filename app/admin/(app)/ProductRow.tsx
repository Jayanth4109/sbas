"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  ViewOffIcon,
  Delete02Icon,
  ShoppingCartCheck01Icon,
  ShoppingCartRemove01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Modal } from "@/components/stepwise/modal";
import { toast } from "@/components/stepwise/toast";
import { DropdownMenu } from "@/components/stepwise/dropdown-menu";
import { SQUIRCLE_BORDER } from "@/lib/ui";

export function ProductRow({ product, photoUrl }: { product: Product; photoUrl: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function patch(body: Record<string, boolean>, successMessage: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(successMessage);
      router.refresh();
    } catch {
      toast.error("Couldn't update this product");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`Deleted "${product.name}"`);
      router.refresh();
    } catch {
      toast.error("Couldn't delete this product");
    } finally {
      setBusy(false);
      setConfirmingDelete(false);
    }
  }

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <Surface
      radius={20}
      lisse={{ middleBorder: SQUIRCLE_BORDER }}
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/admin/products/${product.id}/edit`);
      }}
      className="flex cursor-pointer items-center gap-4 bg-white p-3 transition-colors hover:bg-black/[0.02]"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[16px] bg-brand-soft">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={product.name} className="h-full w-full object-cover" />
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Text variant="caption" className="text-white">
              Out of stock
            </Text>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Text variant="body-soft" className="line-clamp-2">
          {product.name}
        </Text>
        <Text variant="caption-soft" className="mt-0.5 text-[var(--foreground)]/50">
          ₹{product.price}
          {product.quantity && ` · ${product.quantity}`}
          {product.category && ` · ${product.category}`}
          {!product.is_active && " · hidden"}
        </Text>
      </div>
      <div className="flex-shrink-0" onClick={stop}>
        <DropdownMenu
          align="end"
          trigger={
            <button
              type="button"
              disabled={busy}
              aria-label="More actions"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)]/60 hover:bg-black/5 disabled:opacity-40"
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={18} strokeWidth={1.8} />
            </button>
          }
          items={[
            {
              label: product.in_stock ? "Mark out of stock" : "Mark in stock",
              icon: (
                <HugeiconsIcon
                  icon={product.in_stock ? ShoppingCartRemove01Icon : ShoppingCartCheck01Icon}
                  size={16}
                  strokeWidth={1.8}
                />
              ),
              onSelect: () =>
                patch(
                  { in_stock: !product.in_stock },
                  product.in_stock ? "Marked out of stock" : "Marked in stock",
                ),
            },
            {
              label: product.is_active ? "Hide from storefront" : "Show on storefront",
              icon: (
                <HugeiconsIcon icon={product.is_active ? ViewOffIcon : ViewIcon} size={16} strokeWidth={1.8} />
              ),
              onSelect: () =>
                patch(
                  { is_active: !product.is_active },
                  product.is_active ? "Hidden from storefront" : "Now visible on storefront",
                ),
            },
            { separator: true },
            {
              label: "Delete product",
              icon: <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} />,
              destructive: true,
              onSelect: () => setConfirmingDelete(true),
            },
          ]}
        />
      </div>

      <div onClick={stop}>
        <Modal
          open={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          title="Delete product?"
          description={`"${product.name}" will be removed from the storefront and inventory. This can't be undone.`}
          variant="destructive"
          confirmLabel="Delete"
          loading={busy}
          onConfirm={remove}
        />
      </div>
    </Surface>
  );
}
