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
} from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { Modal } from "@/components/stepwise/modal";
import { toast } from "@/components/stepwise/toast";
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
        <Text variant="body-soft" className="truncate">
          {product.name}
        </Text>
        <Text variant="caption-soft" className="text-[var(--foreground)]/50">
          ₹{product.price}
          {product.category && ` · ${product.category}`}
          {!product.is_active && " · hidden"}
        </Text>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1" onClick={stop}>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          disabled={busy}
          aria-label={product.in_stock ? "Mark out of stock" : "Mark in stock"}
          icon={
            <HugeiconsIcon
              icon={product.in_stock ? ShoppingCartRemove01Icon : ShoppingCartCheck01Icon}
              size={16}
              strokeWidth={1.8}
            />
          }
          onClick={() =>
            patch(
              { in_stock: !product.in_stock },
              product.in_stock ? "Marked out of stock" : "Marked in stock",
            )
          }
        />
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          disabled={busy}
          aria-label={product.is_active ? "Hide from storefront" : "Show on storefront"}
          icon={
            <HugeiconsIcon
              icon={product.is_active ? ViewIcon : ViewOffIcon}
              size={16}
              strokeWidth={1.8}
            />
          }
          onClick={() =>
            patch(
              { is_active: !product.is_active },
              product.is_active ? "Hidden from storefront" : "Now visible on storefront",
            )
          }
        />
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          disabled={busy}
          aria-label="Delete"
          icon={<HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} />}
          onClick={() => setConfirmingDelete(true)}
          className="text-rose-500"
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
