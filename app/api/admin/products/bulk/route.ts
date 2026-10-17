import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IDS = 200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Action = "publish" | "hide" | "delete";

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const action = body?.action as Action | undefined;
  const ids: unknown = body?.ids;
  if (action !== "publish" && action !== "hide" && action !== "delete") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_IDS || !ids.every((i) => typeof i === "string" && UUID.test(i))) {
    return NextResponse.json({ error: "Pick between 1 and 200 products" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === "delete") {
    const { data: rows } = await supabase.from("products").select("image_path").in("id", ids);
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const paths = (rows ?? []).map((r) => r.image_path).filter((p): p is string => Boolean(p));
    if (paths.length) await supabase.storage.from("product-photos").remove(paths);
    return NextResponse.json({ changed: ids.length, skipped: 0 });
  }

  if (action === "hide") {
    const { error } = await supabase.from("products").update({ is_active: false }).in("id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ changed: ids.length, skipped: 0 });
  }

  // Publishing: never put a product with no price on the storefront.
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: true })
    .in("id", ids)
    .gt("price", 0)
    .select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ changed: data?.length ?? 0, skipped: ids.length - (data?.length ?? 0) });
}
