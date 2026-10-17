"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { Input } from "@/components/stepwise/input";
import { Button } from "@/components/stepwise/button";
import { Modal } from "@/components/stepwise/modal";
import { toast } from "@/components/stepwise/toast";
import { ProductRow } from "./ProductRow";

export type AdminFilter = "all" | "live" | "hidden" | "noprice" | "nophoto";

const FILTER_LABELS: Record<AdminFilter, string> = {
  all: "All",
  live: "Live",
  hidden: "Hidden",
  noprice: "No price",
  nophoto: "No photo",
};

export function ProductList({
  products,
  photoUrls,
  total,
  page,
  pageSize,
  query,
  filter,
  counts,
}: {
  products: Product[];
  photoUrls: Record<string, string | null>;
  total: number;
  page: number;
  pageSize: number;
  query: string;
  filter: AdminFilter;
  counts: Record<AdminFilter, number>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const firstRender = useRef(true);

  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function go(next: { q?: string; f?: AdminFilter; p?: number }) {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const f = next.f ?? filter;
    const p = next.p ?? 1;
    if (q) params.set("q", q);
    if (f !== "all") params.set("f", f);
    if (p > 1) params.set("p", String(p));
    const qs = params.toString();
    router.replace(qs ? `/admin?${qs}` : "/admin");
  }

  // Debounced search: wait for a pause in typing before asking the server.
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

  // A new page of results means a fresh selection.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set());
  }, [products]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = products.length > 0 && selected.size === products.length;

  async function bulk(action: "publish" | "hide" | "delete") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: [...selected] }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong");
      const verb = action === "publish" ? "Published" : action === "hide" ? "Hidden" : "Deleted";
      toast.success(`${verb} ${body.changed} product${body.changed === 1 ? "" : "s"}`);
      if (body.skipped > 0) toast.error(`${body.skipped} skipped - set a price first`);
      setSelected(new Set());
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label=""
        placeholder="Search your products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.8} />}
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(Object.keys(FILTER_LABELS) as AdminFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => go({ f, p: 1 })}
            className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              f === filter
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--ui-border)] bg-white text-[var(--foreground)]/70 hover:bg-black/[0.03]"
            }`}
          >
            {FILTER_LABELS[f]} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <Text variant="body-soft" className="py-10 text-center text-[var(--foreground)]/45">
          {query ? <>No products match &ldquo;{query}&rdquo;.</> : "Nothing here."}
        </Text>
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-2 px-1 text-[13px] text-[var(--foreground)]/60">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() =>
                setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)))
              }
              className="h-5 w-5 cursor-pointer accent-[var(--brand)]"
            />
            Select all on this page
          </label>

          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                photoUrl={photoUrls[product.id] ?? null}
                selected={selected.has(product.id)}
                onToggleSelect={() => toggle(product.id)}
              />
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button variant="soft" size="sm" disabled={page <= 1} onClick={() => go({ p: page - 1 })}>
                Previous
              </Button>
              <Text variant="caption-soft" className="text-[var(--foreground)]/55">
                Page {page} of {lastPage}
              </Text>
              <Button variant="soft" size="sm" disabled={page >= lastPage} onClick={() => go({ p: page + 1 })}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--ui-border)] bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <Text variant="caption" className="mr-auto text-[var(--foreground)]/70">
              {selected.size} selected
            </Text>
            <Button size="sm" loading={busy} onClick={() => bulk("publish")}>
              Show on storefront
            </Button>
            <Button size="sm" variant="soft" disabled={busy} onClick={() => bulk("hide")}>
              Hide
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setConfirmingDelete(true)}>
              Delete
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title={`Delete ${selected.size} product${selected.size === 1 ? "" : "s"}?`}
        description="They will be removed from the store and inventory. This can't be undone."
        variant="destructive"
        confirmLabel="Delete"
        loading={busy}
        onConfirm={() => bulk("delete")}
      />
    </div>
  );
}
