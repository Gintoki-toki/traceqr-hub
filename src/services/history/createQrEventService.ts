import { supabase } from "../../config/supabase";
import type { QRBatch } from "../../types/batch";

export type ExportEventType =
  | "pdf_downloaded"
  | "csv_downloaded"
  | "print_prepared";

interface RegisterBatchExportEventPayload {
  batch: QRBatch;
  eventType: ExportEventType;
}

function getEventMetadata(batch: QRBatch, eventType: ExportEventType) {
  const exportLabel: Record<ExportEventType, string> = {
    pdf_downloaded: "PDF",
    csv_downloaded: "CSV",
    print_prepared: "PRINT",
  };

  return {
    strategy: "batch_hash_only",
    algorithm: "SHA-512",
    eventSource: "TraceQrHub frontend",
    exportType: exportLabel[eventType],
    quantity: batch.quantity,
    generatedCount: batch.generated_count,
    batchCode: batch.batch_code,
    batchName: batch.name,
    productName: batch.product?.name ?? null,
    productSku: batch.product?.sku ?? null,
    registeredAt: new Date().toISOString(),
  };
}

export async function registerBatchExportEvent({
  batch,
  eventType,
}: RegisterBatchExportEventPayload) {
  if (!batch.company_id) {
    throw new Error("El lote no tiene empresa asociada.");
  }

  if (!batch.id) {
    throw new Error("El lote no tiene ID.");
  }

  const { error } = await supabase.from("qr_events").insert({
    company_id: batch.company_id,
    batch_id: batch.id,
    qr_code_id: null,
    event_type: eventType,
    metadata: getEventMetadata(batch, eventType),
  });

  if (error) {
    throw new Error(error.message);
  }
}