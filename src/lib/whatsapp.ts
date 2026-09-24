import type { Product } from "./types";

export function whatsappOrderLink(product: Pick<Product, "name" | "price">) {
  const number = process.env.WHATSAPP_NUMBER;
  const message = `Hi! I'd like to order:\n\n*${product.name}*\nPrice: ₹${product.price}\n\nIs it available?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
