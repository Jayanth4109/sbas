import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Chip } from "@/components/stepwise/chip";
import { SQUIRCLE_BORDER } from "@/lib/ui";

export const dynamic = "force-dynamic";

type OrderItem = { name: string; price: number; quantity: number };
type OrderRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  user_id: string | null;
};

const statusColor: Record<string, "success" | "info" | "danger"> = {
  confirmed: "success",
  pending: "info",
  cancelled: "danger",
};

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<OrderRow[]>();

  return (
    <div className="flex flex-col gap-5">
      <Text variant="h3">Orders</Text>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <Text variant="h6-soft" className="text-[var(--foreground)]/50">
            No orders yet
          </Text>
          <Text variant="caption-soft" className="text-[var(--foreground)]/35">
            Orders placed on the website will show up here, in addition to the WhatsApp message.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Surface
              key={order.id}
              radius={18}
              lisse={{ middleBorder: SQUIRCLE_BORDER }}
              className="flex flex-col gap-2 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <Text variant="body-soft">
                  {order.customer_name || (order.user_id ? "Signed-in customer" : "Guest")}
                </Text>
                <Chip color={statusColor[order.status] ?? "idle"} size="sm">
                  {order.status}
                </Chip>
              </div>
              {order.customer_phone && (
                <Text variant="caption-soft" className="text-[var(--foreground)]/50">
                  {order.customer_phone}
                </Text>
              )}
              <div className="flex flex-col gap-0.5">
                {order.items.map((item, i) => (
                  <Text key={i} variant="caption-soft" className="text-[var(--foreground)]/70">
                    {item.name} x{item.quantity} - ₹{(item.price * item.quantity).toFixed(0)}
                  </Text>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <Text variant="caption-soft" className="text-[var(--foreground)]/40">
                  {new Date(order.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
                <Text variant="h6-soft" className="text-[var(--brand-strong)]">
                  ₹{order.total}
                </Text>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
