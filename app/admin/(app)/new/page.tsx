import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { isAdminAuthed } from "@/lib/auth";
import { Text } from "@/components/stepwise/typography";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin" className="flex items-center gap-1.5 text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
        <HugeiconsIcon icon={ArrowLeft02Icon} size={18} strokeWidth={1.8} />
        <Text variant="body-soft">Back</Text>
      </Link>
      <Text variant="h3">Add product</Text>
      <ProductForm />
    </div>
  );
}
