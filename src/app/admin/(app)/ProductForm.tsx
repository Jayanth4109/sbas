"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductForm({
  product,
  existingPhotoUrl,
}: {
  product?: Product;
  existingPhotoUrl?: string | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState(product?.description ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPhotoUrl ?? null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  async function generateDescription() {
    if (!name.trim()) {
      setError("Enter the product name first");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, notes }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not generate description");
        return;
      }
      setDescription(body.description);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a product name");
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Enter a valid price");
      return;
    }

    setSaving(true);
    setError(null);
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
        setError(body.error ?? "Could not save product");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <div className="h-40 w-40 overflow-hidden rounded-xl bg-stone-100">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
              No photo
            </div>
          )}
        </div>
        <label className="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700">
          {previewUrl ? "Change photo" : "Take / choose photo"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhotoChange}
            className="hidden"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700">Product name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chyawanprash 500g"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700">Price (₹)</span>
        <input
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="e.g. 250"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-stone-700">
          A few words about it <span className="text-stone-400">(optional)</span>
        </span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. good for digestion, immunity"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-stone-700">Description</span>
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating}
            className="text-sm font-medium text-emerald-700 underline disabled:opacity-50"
          >
            {generating ? "Writing..." : "✨ Write with AI"}
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tap 'Write with AI' to generate this from the name and notes above"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
