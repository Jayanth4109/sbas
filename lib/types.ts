export type SizeUnit = "g" | "ml" | "tablets" | "capsules" | "pcs";

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  description: string | null;
  image_path: string | null;
  category: string | null;
  quantity: string | null;
  size_unit: SizeUnit | null;
  sizes: number[];
  is_active: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
};
