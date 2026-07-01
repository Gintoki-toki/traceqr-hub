export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  status: ProductStatus;
  createdAt: string;
}