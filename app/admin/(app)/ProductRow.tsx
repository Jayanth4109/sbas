"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon, ViewIcon, ViewOffIcon, Delete02Icon } from "@hugeicons/core-free-icons";
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

  async function toggleActive() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(product.is_active ? "Hidden from storefront" : "Now visible on storefront");
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

  return (
    <Surface
      radius={18}
      lisse={{ middleBorder: SQUIRCLE_BORDER }}
      className="flex items-center gap-3 bg-white p-3"
    >
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[12px] bg-brand-soft">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={product.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Text variant="body-soft" className="truncate">
          {product.name}
        </Text>
        <Text variant="caption-soft" className="text-[var(--foreground)]/50">
          ₹{product.price}
          {!product.is_active && " · hidden"}
        </Text>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <Button
          href={`/admin/products/${product.id}/edit`}
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Edit"
          icon={<HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.8} />}
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
          onClick={toggleActive}
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
    </Surface>
  );
}
