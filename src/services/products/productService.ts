import { supabase } from "../../config/supabase";
import type { CreateProductPayload, Product } from "../../types/product";

export async function getCompanyProducts(companyId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      company_id,
      name,
      sku,
      description,
      category,
      status,
      created_by,
      created_at,
      updated_at
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Product[];
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      company_id: payload.companyId,
      name: payload.name.trim(),
      sku: payload.sku.trim(),
      description: payload.description?.trim() || null,
      category: payload.category?.trim() || null,
      status: "active",
      created_by: payload.userId,
    })
    .select(
      `
      id,
      company_id,
      name,
      sku,
      description,
      category,
      status,
      created_by,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}