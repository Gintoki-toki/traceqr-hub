export type BatchStatus = "draft" | "processing" | "generated" | "failed";

export interface BatchProduct {
  id: string;
  name: string;
  sku: string;
}

export interface QRBatch {
  id: string;
  company_id: string;
  product_id: string;
  batch_code: string;
  name: string;
  quantity: number;
  generated_count: number;
  batch_hash: string | null;
  pdf_file_name: string | null;
  pdf_ready: boolean;
  status: BatchStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  product: BatchProduct | null;
}

export interface CreateBatchPayload {
  companyId: string;
  userId: string;
  productId: string;
  name: string;
  quantity: number;
}