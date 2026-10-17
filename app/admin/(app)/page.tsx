import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { ProductList, type AdminFilter } from "./ProductList";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;
const FILTERS: AdminFilter[] = ["all", "live", "hidden", "noprice", "nophoto"];

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; f?: string; p?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const filter = FILTERS.includes(sp.f as AdminFilter) ? (sp.f as AdminFilter) : "all";
  const page = Math.max(1, Number.parseInt(sp.p ?? "1", 10) || 1);

  const supabase = createAdminClient();

  let query = supabase.from("products").select("*", { count: "exact" });
  if (filter === "live") query = query.eq("is_active", true);
  if (filter === "hidden") query = query.eq("is_active", false);
  if (filter === "noprice") query = query.eq("price", 0);
  if (filter === "nophoto") query = query.is("image_path", null);
  if (q) {
    // strip characters that would break out of the PostgREST or() filter
    const safe = q.replace(/[,()%*\\]/g, " ");
    query = query.or(`name.ilike.%${safe}%,category.ilike.%${safe}%`);
  }
  const from = (page - 1) * PAGE_SIZE;
  const { data: products, count } = await query
    .order("name", { ascending: true })
    .range(from, from + PAGE_SIZE - 1)
    .returns<Product[]>();

  const counts = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("price", 0),
    supabase.from("products").select("id", { count: "exact", head: true }).is("image_path", null),
  ]);

  const photoUrls = Object.fromEntries((products ?? []).map((p) => [p.id, publicPhotoUrl(p.image_path)]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Text variant="h3">Products</Text>
        <Button
          href="/admin/new"
          size="default"
          icon={<HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />}
        >
          Add product
        </Button>
      </div>

      <ProductList
        products={products ?? []}
        photoUrls={photoUrls}
        total={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        query={q}
        filter={filter}
        counts={{
          all: counts[0].count ?? 0,
          live: counts[1].count ?? 0,
          hidden: counts[2].count ?? 0,
          noprice: counts[3].count ?? 0,
          nophoto: counts[4].count ?? 0,
        }}
      />
    </div>
  );
}
