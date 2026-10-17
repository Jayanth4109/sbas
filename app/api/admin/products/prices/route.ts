import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ITEMS = 100;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Item = { id: string; price: number; mrp: number | null };

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const publish = body?.publish === true;
  const raw: unknown = body?.items;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ITEMS) {
    return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
  }

  const items: Item[] = [];
  for (const r of raw) {
    const price = Number(r?.price);
    const mrp = r?.mrp === null || r?.mrp === undefined || r?.mrp === "" ? null : Number(r.mrp);
    if (typeof r?.id !== "string" || !UUID.test(r.id)) {
      return NextResponse.json({ error: "Bad product id" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0 || price > 10_000_000) {
      return NextResponse.json({ error: "Every selling price must be more than zero" }, { status: 400 });
    }
    if (mrp !== null && (!Number.isFinite(mrp) || mrp < price)) {
      return NextResponse.json({ error: "Original price can't be lower than the selling price" }, { status: 400 });
    }
    items.push({ id: r.id, price, mrp });
  }

  const supabase = createAdminClient();
  // One small update per product (a few dozen at most); they only touch price fields.
  const results = await Promise.all(
    items.map((it) =>
      supabase
        .from("products")
        .update({ price: it.price, mrp: it.mrp, ...(publish ? { is_active: true } : {}) })
        .eq("id", it.id)
        .select("id"),
    ),
  );
  const failed = results.filter((r) => r.error || !r.data?.length).length;
  if (failed === items.length) {
    return NextResponse.json({ error: "Couldn't save - try again" }, { status: 500 });
  }
  return NextResponse.json({ saved: items.length - failed, failed });
}
