import type { Product } from "./types";

function waLink(message: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function whatsappOrderLink(product: Pick<Product, "name" | "price">) {
  const message = `Hi! I'd like to order:\n\n*${product.name}*\nPrice: ₹${product.price}\n\nIs it available?`;
  return waLink(message);
}

export function whatsappCartOrderLink(items: { name: string; price: number; quantity: number }[]) {
  const lines = items.map(
    (i) => `*${i.name}* x${i.quantity} - ₹${(i.price * i.quantity).toFixed(0)}`,
  );
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const message = `Hi! I'd like to order:\n\n${lines.join("\n")}\n\nTotal: ₹${total.toFixed(0)}\n\nPlease confirm availability.`;
  return waLink(message);
}
