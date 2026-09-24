"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductRow({ product, photoUrl }: { product: Product; photoUrl: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setBusy(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={product.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-stone-900">{product.name}</p>
        <p className="text-sm text-stone-500">₹{product.price}</p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <Link href={`/admin/products/${product.id}/edit`} className="text-xs text-emerald-700 underline">
          Edit
        </Link>
        <button disabled={busy} onClick={toggleActive} className="text-xs text-stone-500 underline">
          {product.is_active ? "Hide" : "Show"}
        </button>
        <button disabled={busy} onClick={remove} className="text-xs text-red-600 underline">
          Delete
        </button>
      </div>
    </div>
  );
}
