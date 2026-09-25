"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, ShoppingCart01Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Surface } from "@/components/stepwise/primitives/surface";
import { Text } from "@/components/stepwise/typography";
import { Button } from "@/components/stepwise/button";
import { QtyInput } from "@/components/stepwise/qty-input";
import { toast } from "@/components/stepwise/toast";
import { useCart } from "@/lib/cart";
import { whatsappCartOrderLink } from "@/lib/whatsapp";
import { SQUIRCLE_BORDER } from "@/lib/ui";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Sri Babuji Ayurvedic Stores";

export default function CartPage() {
  const { items, setQuantity, removeItem, clear, total } = useCart();
  const [placing, setPlacing] = useState(false);

  async function orderViaWhatsApp() {
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Couldn't place your order, please try again");
        return;
      }
      const link = whatsappCartOrderLink(
        body.order.items.map((i: { name: string; price: number; quantity: number }) => i),
      );
      window.open(link, "_blank", "noopener,noreferrer");
      clear();
      toast.success("Order sent - continue on WhatsApp to confirm");
    } catch {
      toast.error("Couldn't place your order, please try again");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader storeName={STORE_NAME} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10 sm:px-8">
        <Text variant="h2" className="mb-8">
          Your cart
        </Text>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-[var(--brand-strong)]">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={24} strokeWidth={1.6} />
            </span>
            <Text variant="h6-soft" className="text-[var(--foreground)]/60">
              Your cart is empty
            </Text>
            <Button href="/products" size="sm">
              Browse products
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Surface
                key={item.productId}
                radius={18}
                lisse={{ middleBorder: SQUIRCLE_BORDER }}
                className="flex items-center gap-3 bg-white p-3"
              >
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[12px] bg-brand-soft">
                  {item.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photoUrl} alt={item.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Text variant="body-soft" className="truncate">
                    {item.name}
                  </Text>
                  <Text variant="caption-soft" className="text-[var(--foreground)]/50">
                    ₹{item.price} each
                  </Text>
                </div>
                <QtyInput
                  value={item.quantity}
                  min={1}
                  max={99}
                  onChange={(q) => setQuantity(item.productId, q)}
                  ariaLabel={`Quantity for ${item.name}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={`Remove ${item.name}`}
                  icon={<HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.8} />}
                  onClick={() => removeItem(item.productId)}
                  className="text-rose-500"
                />
              </Surface>
            ))}

            <div className="mt-4 flex items-center justify-between">
              <Text variant="h6-soft">Total</Text>
              <Text variant="h4" className="text-[var(--brand-strong)]">
                ₹{total.toFixed(0)}
              </Text>
            </div>

            <Button
              size="lg"
              fullWidth
              loading={placing}
              icon={<HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={2} />}
              onClick={orderViaWhatsApp}
              className="mt-2 bg-gradient-to-b from-[var(--brand)] to-[var(--brand-strong)]"
            >
              Order all on WhatsApp
            </Button>

            <Link href="/products" className="mt-1 text-center">
              <Text variant="caption-soft" className="text-[var(--foreground)]/50 hover:text-[var(--foreground)]">
                Continue shopping
              </Text>
            </Link>
          </div>
        )}
      </div>

      <SiteFooter storeName={STORE_NAME} />
    </div>
  );
}
