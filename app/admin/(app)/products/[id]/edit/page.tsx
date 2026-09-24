import { notFound, redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPhotoUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { Text } from "@/components/stepwise/typography";
import { ProductForm } from "../../../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Product>();

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Text variant="h3">Edit product</Text>
      <ProductForm product={product} existingPhotoUrl={publicPhotoUrl(product.image_path)} />
    </div>
  );
}
