export type BatchStatus = "generated" | "processing" | "draft" | "failed";

export interface QRBatch {
  id: string;
  batchCode: string;
  name: string;
  productName: string;
  productSku: string;
  quantity: number;
  generatedCount: number;
  status: BatchStatus;
  pdfReady: boolean;
  pdfFileName: string;
  createdAt: string;
  createdBy: string;
}