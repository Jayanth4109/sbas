import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-900">Add product</h1>
      <ProductForm />
    </div>
  );
}
