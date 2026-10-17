"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Text } from "@/components/stepwise/typography";
import { Input } from "@/components/stepwise/input";
import { Chip } from "@/components/stepwise/chip";
import { Button } from "@/components/stepwise/button";

export function ProductsBrowser({
  products,
  photoUrls,
  categories,
  total,
  page,
  pageSize,
  query,
  category,
}: {
  products: Product[];
  photoUrls: Record<string, string | null>;
  categories: string[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  category: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const firstRender = useRef(true);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function go(next: { q?: string; category?: string; p?: number }, scroll = false) {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const c = next.category ?? category;
    const p = next.p ?? 1;
    if (q) params.set("q", q);
    if (c) params.set("category", c);
    if (p > 1) params.set("p", String(p));
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products", { scroll });
  }

  // Wait for a pause in typing before asking the server.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (search.trim() !== query) go({ q: search.trim(), p: 1 });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filtered = products;

  function selectCategory(next: string) {
    go({ category: next, p: 1 });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-col gap-4">
        <Input
          label=""
          placeholder="Search medicines, categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.8} />}
        />

        {categories.length > 0 && (
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => selectCategory("")} className="shrink-0">
              <Chip
                variant={category === "" ? "solid" : "soft"}
                color={category === "" ? "success" : "idle"}
                size="default"
              >
                All
              </Chip>
            </button>
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => selectCategory(c)} className="shrink-0">
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
                setSearch("");
                go({ q: "", category: "", p: 1 });
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

      {lastPage > 1 && (
        <div className="mt-10 flex items-center justify-between">
          <Button variant="soft" size="sm" disabled={page <= 1} onClick={() => go({ p: page - 1 }, true)}>
            Previous
          </Button>
          <Text variant="caption-soft" className="text-[var(--foreground)]/55">
            Page {page} of {lastPage}
          </Text>
          <Button variant="soft" size="sm" disabled={page >= lastPage} onClick={() => go({ p: page + 1 }, true)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
