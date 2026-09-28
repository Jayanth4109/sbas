"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Text } from "@/components/stepwise/typography";
import { Input } from "@/components/stepwise/input";
import { Chip } from "@/components/stepwise/chip";

export function ProductsBrowser({
  products,
  photoUrls,
}: {
  products: Product[];
  photoUrls: Record<string, string | null>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category?.trim()) set.add(p.category.trim());
    }
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
  }, [products, query, category]);

  function selectCategory(next: string) {
    setCategory(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("category", next);
    else params.delete("category");
    router.replace(params.size ? `/products?${params.toString()}` : "/products", { scroll: false });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-col gap-4">
        <Input
          label=""
          placeholder="Search medicines, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.8} />}
        />

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => selectCategory("")}>
              <Chip
                variant={category === "" ? "solid" : "soft"}
                color={category === "" ? "success" : "idle"}
                size="default"
              >
                All
              </Chip>
            </button>
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => selectCategory(c)}>
                <Chip
                  variant={category === c ? "solid" : "soft"}
                  color={category === c ? "success" : "idle"}
                  size="default"
                >
                  {c}
                </Chip>
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <HugeiconsIcon icon={Search01Icon} size={32} strokeWidth={1.4} className="text-[var(--foreground)]/20" />
          <Text variant="h5-soft" className="text-[var(--foreground)]/50">
            No matches found
          </Text>
          <Text variant="caption-soft" className="max-w-xs text-[var(--foreground)]/35">
            Try a different search term, or browse another category.
          </Text>
          {(query || category) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                selectCategory("");
              }}
              className="mt-1 flex items-center gap-1 text-[13px] font-medium text-[var(--brand-strong)] hover:underline"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              photoUrl={photoUrls[product.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
