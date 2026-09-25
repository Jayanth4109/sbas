import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Avatar } from "@/components/stepwise/avatar";
import { SQUIRCLE_BORDER } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const supabase = createAdminClient();
  const [{ data: userList }, { data: orders }] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from("orders").select("user_id, total").not("user_id", "is", null),
  ]);

  const orderStats = new Map<string, { count: number; total: number }>();
  for (const order of orders ?? []) {
    if (!order.user_id) continue;
    const existing = orderStats.get(order.user_id) ?? { count: 0, total: 0 };
    existing.count += 1;
    existing.total += order.total;
    orderStats.set(order.user_id, existing);
  }

  const customers = (userList?.users ?? [])
    .map((u) => ({
      id: u.id,
      name: u.user_metadata?.full_name || u.email || "Customer",
      email: u.email,
      createdAt: u.created_at,
      stats: orderStats.get(u.id) ?? { count: 0, total: 0 },
    }))
    .sort((a, b) => b.stats.count - a.stats.count);

  return (
    <div className="flex flex-col gap-5">
      <Text variant="h3">Customers</Text>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <Text variant="h6-soft" className="text-[var(--foreground)]/50">
            No sign-ups yet
          </Text>
          <Text variant="caption-soft" className="text-[var(--foreground)]/35">
            Customers who sign in on the website will show up here.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {customers.map((customer) => (
            <Surface
              key={customer.id}
              radius={18}
              lisse={{ middleBorder: SQUIRCLE_BORDER }}
              className="flex items-center gap-3 bg-white p-3"
            >
              <Avatar name={customer.name} variant="letter" size="default" showTooltip={false} />
              <div className="min-w-0 flex-1">
                <Text variant="body-soft" className="truncate">
                  {customer.name}
                </Text>
                <Text variant="caption-soft" className="text-[var(--foreground)]/50">
                  {customer.stats.count} order{customer.stats.count === 1 ? "" : "s"}
                  {customer.stats.count > 0 && ` - ₹${customer.stats.total.toFixed(0)} total`}
                </Text>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
