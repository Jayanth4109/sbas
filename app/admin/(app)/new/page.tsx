import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { Text } from "@/components/stepwise/typography";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-5">
      <Text variant="h3">Add product</Text>
      <ProductForm />
    </div>
  );
}
