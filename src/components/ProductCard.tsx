import type { Product } from "@/lib/types";
import { whatsappOrderLink } from "@/lib/whatsapp";

export function ProductCard({ product, photoUrl }: { product: Product; photoUrl: string | null }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="relative aspect-square w-full bg-stone-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-stone-900">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-3 text-sm text-stone-600">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-emerald-700">₹{product.price}</span>
          <a
            href={whatsappOrderLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
