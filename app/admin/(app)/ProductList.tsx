"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { Input } from "@/components/stepwise/input";
import { ProductRow } from "./ProductRow";

export function ProductList({
  products,
  photoUrls,
}: {
  products: Product[];
  photoUrls: Record<string, string | null>;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [products, query]);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <Text variant="h6-soft" className="text-[var(--foreground)]/50">
          No products yet
        </Text>
        <Text variant="caption-soft" className="text-[var(--foreground)]/35">
          Tap &ldquo;Add product&rdquo; to add your first one.
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label=""
        placeholder="Search your products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        icon={<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.8} />}
      />

      {filtered.length === 0 ? (
        <Text variant="body-soft" className="py-10 text-center text-[var(--foreground)]/45">
          No products match &ldquo;{query}&rdquo;.
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((product) => (
            <ProductRow key={product.id} product={product} photoUrl={photoUrls[product.id] ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
