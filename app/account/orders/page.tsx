import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Chip } from "@/components/stepwise/chip";
import { SignOutButton } from "@/components/SignOutButton";
import { SQUIRCLE_BORDER } from "@/lib/ui";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
};

const statusColor: Record<string, "success" | "info" | "danger"> = {
  confirmed: "success",
  pending: "info",
  cancelled: "danger",
};

export default async function OrdersPage() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/account/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, items, total, status, created_at")
    .order("created_at", { ascending: false })
    .returns<Order[]>();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader storeName={STORE_NAME} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Text variant="h2">Your orders</Text>
          <SignOutButton />
        </div>

        {!orders || orders.length === 0 ? (
          <Text variant="body-soft" className="text-[var(--foreground)]/50">
            You haven&apos;t placed any orders yet.
          </Text>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <Surface
                key={order.id}
                radius={18}
                lisse={{ middleBorder: SQUIRCLE_BORDER }}
                className="flex flex-col gap-3 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <Text variant="caption-soft" className="text-[var(--foreground)]/50">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                  <Chip color={statusColor[order.status] ?? "idle"} size="sm">
                    {order.status}
                  </Chip>
                </div>
                <div className="flex flex-col gap-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Text variant="body-soft">
                        {item.name} x{item.quantity}
                      </Text>
                      <Text variant="body-soft" className="text-[var(--foreground)]/60">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </Text>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-[var(--ui-border-subtle)] pt-2">
                  <Text variant="caption">Total</Text>
                  <Text variant="h6-soft" className="text-[var(--brand-strong)]">
                    ₹{order.total}
                  </Text>
                </div>
              </Surface>
            ))}
          </div>
        )}
      </div>

      <SiteFooter storeName={STORE_NAME} />
    </div>
  );
}
