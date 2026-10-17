// `mrp` is the original price, `price` is what the shop actually sells at.
export function discountPercent(mrp: number | null | undefined, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
