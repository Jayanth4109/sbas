import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCT_PHOTOS_BUCKET } from "@/lib/storage";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createAdminClient();

  const contentType = req.headers.get("content-type") ?? "";
  const updates: Record<string, unknown> = {};

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const name = form.get("name");
    const priceRaw = form.get("price");
    const description = form.get("description");
    const isActive = form.get("is_active");
    const photo = form.get("photo");

    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (priceRaw !== null) {
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "Enter a valid price" }, { status: 400 });
      }
      updates.price = price;
    }
    if (typeof description === "string") updates.description = description.trim() || null;
    if (typeof isActive === "string") updates.is_active = isActive === "true";

    if (photo instanceof File && photo.size > 0) {
      if (photo.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: "Photo is too large (max 8MB)" }, { status: 400 });
      }
      if (!ALLOWED_TYPES.has(photo.type)) {
        return NextResponse.json({ error: "Photo must be JPEG, PNG, or WebP" }, { status: 400 });
      }
      const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
      const imagePath = `${randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_PHOTOS_BUCKET)
        .upload(imagePath, photo, { contentType: photo.type });
      if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
      updates.image_path = imagePath;
    }
  } else {
    const body = await req.json().catch(() => ({}));
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
