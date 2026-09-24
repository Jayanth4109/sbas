export const PRODUCT_PHOTOS_BUCKET = "product-photos";

export function publicPhotoUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${PRODUCT_PHOTOS_BUCKET}/${imagePath}`;
}
