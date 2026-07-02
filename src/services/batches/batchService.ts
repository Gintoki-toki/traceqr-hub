import { supabase } from "../../config/supabase";
import type {
  BatchProduct,
  CreateBatchPayload,
  QRBatch,
} from "../../types/batch";

type SupabaseBatchResponse = Omit<QRBatch, "product"> & {
  product: BatchProduct | BatchProduct[] | null;
};

export interface GenerateBatchHashResponse {
  success?: boolean;
  message?: string;
  error?: string;
  batch?: {
    id: string;
    batchCode: string;
    quantity: number;
    generatedCount: number;
    status: "generated";
    pdfReady: boolean;
  };
}

function generateBatchCode() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `LOT-${year}-${random}`;
}

function normalizeBatch(batch: SupabaseBatchResponse): QRBatch {
  return {
    ...batch,
    product: Array.isArray(batch.product)
      ? batch.product[0] ?? null
      : batch.product,
  };
}

export async function getCompanyBatches(companyId: string): Promise<QRBatch[]> {
  const { data, error } = await supabase
    .from("qr_batches")
    .select(
      `
      id,
      company_id,
      product_id,
      batch_code,
      name,
      quantity,
      generated_count,
      batch_hash,
      pdf_file_name,
      pdf_ready,
      status,
      created_by,
      created_at,
      updated_at,
      product:products (
        id,
        name,
        sku
      )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const batches = (data ?? []) as unknown as SupabaseBatchResponse[];

  return batches.map(normalizeBatch);
}

export async function createBatch(
  payload: CreateBatchPayload
): Promise<QRBatch> {
  const { data, error } = await supabase
    .from("qr_batches")
    .insert({
      company_id: payload.companyId,
      product_id: payload.productId,
      batch_code: generateBatchCode(),
      name: payload.name.trim(),
      quantity: payload.quantity,
      generated_count: 0,
      pdf_ready: false,
      status: "draft",
      created_by: payload.userId,
    })
    .select(
      `
      id,
      company_id,
      product_id,
      batch_code,
      name,
      quantity,
      generated_count,
      batch_hash,
      pdf_file_name,
      pdf_ready,
      status,
      created_by,
      created_at,
      updated_at,
      product:products (
        id,
        name,
        sku
      )
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const batch = data as unknown as SupabaseBatchResponse;

  return normalizeBatch(batch);
}

export async function generateBatchHash(batchId: string) {
  const { data, error } =
    await supabase.functions.invoke<GenerateBatchHashResponse>(
      "generate-batch-hash",
      {
        body: {
          batchId,
        },
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.error ?? "No se pudo generar el lote.");
  }

  return data;
}