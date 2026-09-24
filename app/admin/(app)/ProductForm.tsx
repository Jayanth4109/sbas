"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, AiMagicIcon } from "@hugeicons/core-free-icons";
import type { Product } from "@/lib/types";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Input } from "@/components/stepwise/input";
import { Button } from "@/components/stepwise/button";
import { toast } from "@/components/stepwise/toast";

export function ProductForm({
  product,
  existingPhotoUrl,
}: {
  product?: Product;
  existingPhotoUrl?: string | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState(product?.description ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPhotoUrl ?? null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  async function generateDescription() {
    if (!name.trim()) {
      setNameError("Enter the product name first");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, notes }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not generate description");
        return;
      }
      setDescription(body.description);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    setPriceError(null);

    let hasError = false;
    if (!name.trim()) {
      setNameError("Enter a product name");
      hasError = true;
    }
    const priceNum = Number(price);
    if (!price.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
      setPriceError("Enter a valid price");
      hasError = true;
    }
    if (hasError) return;

    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("price", price);
      form.set("description", description);
      if (photoFile) form.set("photo", photoFile);

      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", body: form });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not save product");
        return;
      }
      toast.success(isEdit ? "Changes saved" : "Product added");
      router.replace("/admin");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <Surface
          radius={24}
          className="h-40 w-40 overflow-hidden border border-[var(--ui-border)] bg-brand-soft"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <HugeiconsIcon
                icon={Camera01Icon}
                size={32}
                strokeWidth={1.5}
                className="text-[var(--brand-strong)]/40"
              />
            </div>
          )}
        </Surface>
        <Button
          type="button"
          variant="soft"
          size="sm"
          icon={<HugeiconsIcon icon={Camera01Icon} size={15} strokeWidth={1.8} />}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? "Change photo" : "Take / choose photo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoChange}
          className="hidden"
        />
      </div>

      <Input
        label="Product name"
        placeholder="e.g. Chyawanprash 500g"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={nameError ?? undefined}
      />

      <Input
        label="Price (₹)"
        inputMode="decimal"
        placeholder="e.g. 250"
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
        error={priceError ?? undefined}
      />

      <Input
        label="A few words about it (optional)"
        placeholder="e.g. good for digestion, immunity"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Text variant="caption" className="text-[var(--foreground)]/70">
            Description
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={generating}
            icon={<HugeiconsIcon icon={AiMagicIcon} size={14} strokeWidth={1.8} />}
            onClick={generateDescription}
          >
            Write with AI
          </Button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tap 'Write with AI' to generate this from the name and notes above"
          className="rounded-[14px] border border-[var(--ui-border)] bg-white px-3.5 py-2.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={saving}>
        {isEdit ? "Save changes" : "Add product"}
      </Button>
    </form>
  );
}
