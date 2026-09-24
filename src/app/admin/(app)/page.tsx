import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">Products</h1>
        <Link
          href="/admin/new"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          + Add product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="mt-10 text-center text-stone-500">
          No products yet. Tap &ldquo;Add product&rdquo; to add your first one.
        </p>
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
