export type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
