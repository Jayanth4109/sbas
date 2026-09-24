import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

const MAX_ITEMS = 50;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const cartItems: unknown = body?.items;
  if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > MAX_ITEMS) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const requested = new Map<string, number>();
  for (const entry of cartItems) {
    const productId = entry?.productId;
    const quantity = Number(entry?.quantity);
    if (typeof productId !== "string" || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
    }
    requested.set(productId, quantity);
  }

  const admin = createAdminClient();
  const { data: products, error: fetchError } = await admin
    .from("products")
    .select("id, name, price")
    .in("id", Array.from(requested.keys()))
    .eq("is_active", true);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!products || products.length !== requested.size) {
    return NextResponse.json(
      { error: "One or more items in your cart are no longer available" },
      { status: 409 },
    );
  }

  // Prices and names come from the database, never the client, so a
  // tampered request can't discount an order or rename an item.
  const items = products.map((p) => ({
    product_id: p.id,
    name: p.name,
    price: p.price,
    quantity: requested.get(p.id)!,
  }));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const customerName = typeof body?.customerName === "string" ? body.customerName.trim().slice(0, 200) : null;
  const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone.trim().slice(0, 30) : null;

  const { data: order, error: insertError } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      customer_name: customerName || user?.user_metadata?.full_name || null,
      customer_phone: customerPhone,
      items,
      total,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ order }, { status: 201 });
}
