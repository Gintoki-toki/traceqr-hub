export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  company_id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string | null;
  status: ProductStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  companyId: string;
  userId: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
}