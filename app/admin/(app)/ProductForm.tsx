"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, ImageUpload01Icon, AiMagicIcon } from "@hugeicons/core-free-icons";
import type { Product, SizeUnit } from "@/lib/types";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Input } from "@/components/stepwise/input";
import { Button } from "@/components/stepwise/button";
import { Toggle } from "@/components/stepwise/toggle";
import { Segment } from "@/components/stepwise/segment";
import { toast } from "@/components/stepwise/toast";
import { SQUIRCLE_BORDER } from "@/lib/ui";
import { discountPercent } from "@/lib/discount";
import { SIZE_UNITS } from "@/lib/sizes";

export function ProductForm({
  product,
  existingPhotoUrl,
}: {
  product?: Product;
  existingPhotoUrl?: string | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [mrp, setMrp] = useState(product?.mrp?.toString() ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [quantity, setQuantity] = useState(product?.quantity ?? "");
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>(product?.size_unit ?? "g");
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") ?? "");
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState(product?.description ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPhotoUrl ?? null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [mrpError, setMrpError] = useState<string | null>(null);

  const priceNum = Number(price);
  const mrpNum = Number(mrp);
  const livePercent =
    mrp.trim() && priceNum > 0 && Number.isFinite(mrpNum) ? discountPercent(mrpNum, priceNum) : 0;

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
    setMrpError(null);

    let hasError = false;
    if (!name.trim()) {
      setNameError("Enter a product name");
      hasError = true;
    }
    if (!price.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
      setPriceError("Enter a valid selling price");
      hasError = true;
    }
    if (mrp.trim()) {
      if (!Number.isFinite(mrpNum) || mrpNum <= 0) {
        setMrpError("Enter a valid original price");
        hasError = true;
      } else if (Number.isFinite(priceNum) && mrpNum < priceNum) {
        setMrpError("Original price can't be lower than the selling price");
        hasError = true;
      }
    }
    if (hasError) return;

    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("price", price);
      form.set("mrp", mrp);
      form.set("description", description);
      form.set("category", category);
      form.set("quantity", quantity);
      form.set("size_unit", sizeUnit);
      form.set("sizes", sizes);
      form.set("in_stock", String(inStock));
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
          lisse={{ middleBorder: SQUIRCLE_BORDER }}
          className="h-40 w-40 overflow-hidden bg-brand-soft"
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
        <div className="flex gap-2">
          <Button
            type="button"
            variant="soft"
            size="sm"
            icon={<HugeiconsIcon icon={Camera01Icon} size={15} strokeWidth={1.8} />}
            onClick={() => cameraInputRef.current?.click()}
          >
            Take photo
          </Button>
          <Button
            type="button"
            variant="soft"
            size="sm"
            icon={<HugeiconsIcon icon={ImageUpload01Icon} size={15} strokeWidth={1.8} />}
            onClick={() => galleryInputRef.current?.click()}
          >
            Choose from gallery
          </Button>
        </div>
        {/* Two separate inputs, not one with a capture attribute: some mobile
            browsers drop the gallery option entirely when accept+capture are
            combined, which is exactly the "can't get a real camera view" bug
            this was built to avoid. */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoChange}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
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
        label="Original price - MRP (₹) (optional)"
        inputMode="decimal"
        placeholder="e.g. 500"
        value={mrp}
        onChange={(e) => {
          setMrp(e.target.value.replace(/[^0-9.]/g, ""));
          setMrpError(null);
        }}
        error={mrpError ?? undefined}
        hint="Fill this only if you're giving a discount"
      />

      <Input
        label="Your selling price (₹)"
        inputMode="decimal"
        placeholder="e.g. 425"
        value={price}
        onChange={(e) => {
          setPrice(e.target.value.replace(/[^0-9.]/g, ""));
          setPriceError(null);
          setMrpError(null);
        }}
        error={priceError ?? undefined}
        hint={
          livePercent > 0
            ? `Customers will see ${livePercent}% off - they save ₹${(mrpNum - priceNum).toFixed(0)}`
            : undefined
        }
      />

      <Input
        label="Category (optional)"
        placeholder="e.g. Immunity, Digestion, Skin Care"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Input
        label="Quantity / pack size (optional)"
        placeholder="e.g. 60 Tablets, 500 ml, 100 g"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <Text variant="caption" className="text-[var(--foreground)]/70">
          Sizes available (optional)
        </Text>
        <Segment
          size="sm"
          options={SIZE_UNITS.map((u) => ({ value: u.value, label: u.label }))}
          value={sizeUnit}
          onChange={setSizeUnit}
        />
        <Input
          aria-label="Sizes available"
          inputMode="decimal"
          placeholder={sizeUnit === "g" ? "e.g. 100, 200, 500" : sizeUnit === "ml" ? "e.g. 100, 200, 450" : "e.g. 30, 60, 100"}
          value={sizes}
          onChange={(e) => setSizes(e.target.value.replace(/[^0-9., ]/g, ""))}
          hint="Separate sizes with commas. Customers see these on the product."
        />
      </div>

      <Toggle
        checked={inStock}
        onChange={setInStock}
        label="In stock"
        hint={inStock ? "Customers can order this" : "Shown as out of stock on the storefront"}
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
          className="rounded-[14px] border border-[var(--ui-border)] bg-white px-3.5 py-2.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={saving} className="mb-[env(safe-area-inset-bottom)]">
        {isEdit ? "Save changes" : "Add product"}
      </Button>
    </form>
  );
}
