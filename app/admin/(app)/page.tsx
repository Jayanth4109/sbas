import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { ProductList } from "./ProductList";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  const photoUrls = Object.fromEntries(
    (products ?? []).map((p) => [p.id, publicPhotoUrl(p.image_path)]),
  );

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

      <ProductList products={products ?? []} photoUrls={photoUrls} />
    </div>
  );
}
