"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { Input } from "@/components/stepwise/input";
import { Button } from "@/components/stepwise/button";
import { toast } from "@/components/stepwise/toast";
import { discountPercent } from "@/lib/discount";

export type PriceFilter = "todo" | "all";

type Entry = { mrp: string; price: string };

const field =
  "h-11 w-full rounded-[12px] border border-[var(--ui-border)] bg-white px-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";

function clean(v: string) {
  return v.replace(/[^0-9.]/g, "");
}

export function PriceSheet({
  products,
  photoUrls,
  total,
  page,
  pageSize,
  query,
  filter,
}: {
  products: Product[];
  photoUrls: Record<string, string | null>;
  total: number;
  page: number;
  pageSize: number;
  query: string;
  filter: PriceFilter;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [publish, setPublish] = useState(true);
  const [saving, setSaving] = useState(false);
  const firstRender = useRef(true);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function go(next: { q?: string; f?: PriceFilter; p?: number }) {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const f = next.f ?? filter;
    const p = next.p ?? 1;
    if (q) params.set("q", q);
    if (f !== "todo") params.set("f", f);
    if (p > 1) params.set("p", String(p));
    const qs = params.toString();
    router.replace(qs ? `/admin/prices?${qs}` : "/admin/prices");
  }

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries({});
  }, [products]);

  function entryFor(p: Product): Entry {
    return entries[p.id] ?? { mrp: p.mrp ? String(p.mrp) : "", price: p.price > 0 ? String(p.price) : "" };
  }
  function edit(p: Product, patch: Partial<Entry>) {
    setEntries((prev) => ({ ...prev, [p.id]: { ...entryFor(p), ...patch } }));
  }

  // What each edited row would be saved as. One number means "sell at that price".
  function resolve(e: Entry): { price: number; mrp: number | null } | { error: string } {
    const mrp = Number(e.mrp);
    const price = Number(e.price);
    const hasMrp = e.mrp.trim() !== "" && Number.isFinite(mrp) && mrp > 0;
    const hasPrice = e.price.trim() !== "" && Number.isFinite(price) && price > 0;
    if (!hasMrp && !hasPrice) return { error: "Enter a price" };
    if (hasMrp && hasPrice) {
      if (price > mrp) return { error: "Selling price is higher than MRP" };
      return { price, mrp };
    }
    if (hasMrp) return { price: mrp, mrp };
    return { price, mrp: null };
  }

  const dirty = products.filter((p) => entries[p.id]);
  const rows = dirty.map((p) => ({ p, r: resolve(entries[p.id]) }));
  const bad = rows.filter((x) => "error" in x.r);
  // A row the user touched but left blank is ignored, not an error.
  const ready = rows.filter((x) => !("error" in x.r)) as { p: Product; r: { price: number; mrp: number | null } }[];
  const blankTouched = bad.filter((x) => (x.r as { error: string }).error === "Enter a price").length;
  const realErrors = bad.length - blankTouched;

  async function save() {
    if (realErrors > 0) {
      toast.error("Fix the rows marked in red first");
      return;
    }
    if (ready.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publish,
          items: ready.map(({ p, r }) => ({ id: p.id, price: r.price, mrp: r.mrp })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't save");
      toast.success(`Saved ${body.saved} price${body.saved === 1 ? "" : "s"}${publish ? " - now on the storefront" : ""}`);
      if (body.failed > 0) toast.error(`${body.failed} didn't save - try them again`);
      setEntries({});
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label=""
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.8} />}
      />

      <div className="flex gap-2">
        {(["todo", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => go({ f, p: 1 })}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              f === filter
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--ui-border)] bg-white text-[var(--foreground)]/70 hover:bg-black/[0.03]"
            }`}
          >
            {f === "todo" ? "No price yet" : "All products"}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <Text variant="body-soft" className="py-10 text-center text-[var(--foreground)]/45">
          {query ? <>No products match &ldquo;{query}&rdquo;.</> : "All done - every product has a price."}
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => {
            const e = entryFor(p);
            const res = entries[p.id] ? resolve(e) : null;
            const err = res && "error" in res && res.error !== "Enter a price" ? res.error : null;
            const pct = res && !("error" in res) && res.mrp ? discountPercent(res.mrp, res.price) : 0;
            const photo = photoUrls[p.id];
            return (
              <div
                key={p.id}
                className={`flex flex-col gap-2.5 rounded-[18px] border bg-white p-3 ${
                  err ? "border-rose-300" : entries[p.id] ? "border-[var(--brand)]/50" : "border-[var(--ui-border)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-[12px] bg-brand-soft">
                    {photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <Text variant="body-soft" className="line-clamp-2 flex-1">
                    {p.name}
                  </Text>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1">
                    <span className="text-[12px] text-[var(--foreground)]/55">MRP (₹)</span>
                    <input
                      className={field}
                      inputMode="decimal"
                      placeholder="e.g. 160"
                      value={e.mrp}
                      onChange={(ev) => edit(p, { mrp: clean(ev.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[12px] text-[var(--foreground)]/55">Your price (₹)</span>
                    <input
                      className={field}
                      inputMode="decimal"
                      placeholder="same as MRP"
                      value={e.price}
                      onChange={(ev) => edit(p, { price: clean(ev.target.value) })}
                    />
                  </label>
                </div>
                {err && <span className="text-[12px] text-rose-600">{err}</span>}
                {!err && pct > 0 && (
                  <span className="text-[12px] text-[var(--brand-strong)]">Customers will see {pct}% off</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between pt-1">
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

      {ready.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--ui-border)] bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--foreground)]/70">
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-[var(--brand)]"
              />
              Also show these on the storefront
            </label>
            <Button size="lg" fullWidth loading={saving} onClick={save}>
              Save {ready.length} price{ready.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
