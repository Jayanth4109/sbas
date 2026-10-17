import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { PriceSheet, type PriceFilter } from "./PriceSheet";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; f?: string; p?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const filter: PriceFilter = sp.f === "all" ? "all" : "todo";
  const page = Math.max(1, Number.parseInt(sp.p ?? "1", 10) || 1);

  const supabase = createAdminClient();
  let query = supabase.from("products").select("*", { count: "exact" });
  if (filter === "todo") query = query.eq("price", 0);
  if (q) {
    const safe = q.replace(/[,()%*\\]/g, " ");
    query = query.or(`name.ilike.%${safe}%,category.ilike.%${safe}%`);
  }
  const from = (page - 1) * PAGE_SIZE;
  const { data: products, count } = await query
    .order("name", { ascending: true })
    .range(from, from + PAGE_SIZE - 1)
    .returns<Product[]>();

  const { count: remaining } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("price", 0);

  const photoUrls = Object.fromEntries((products ?? []).map((p) => [p.id, publicPhotoUrl(p.image_path)]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Text variant="h3">Set prices</Text>
        <Text variant="caption-soft" className="text-[var(--foreground)]/55">
          Type the MRP, and your selling price if it&apos;s lower. {remaining ?? 0} products still have no price.
        </Text>
      </div>
      <PriceSheet
        products={products ?? []}
        photoUrls={photoUrls}
        total={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        query={q}
        filter={filter}
      />
    </div>
  );
}
