import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { ProductRow } from "./ProductRow";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Text variant="h3">Products</Text>
        <Button
          href="/admin/new"
          size="sm"
          icon={<HugeiconsIcon icon={PlusSignIcon} size={15} strokeWidth={2} />}
        >
          Add product
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <Text variant="h6-soft" className="text-[var(--foreground)]/50">
            No products yet
          </Text>
          <Text variant="caption-soft" className="text-[var(--foreground)]/35">
            Tap &ldquo;Add product&rdquo; to add your first one.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              photoUrl={publicPhotoUrl(product.image_path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
