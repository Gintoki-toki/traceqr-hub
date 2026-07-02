export interface QREventMetadata {
  strategy?: string;
  algorithm?: string;
  qrDerivation?: string;
  quantity?: number;
  batchCode?: string;
  [key: string]: unknown;
}

export interface QREvent {
  id: string;
  company_id: string;
  batch_id: string | null;
  qr_code_id: string | null;
  event_type: string;
  metadata: QREventMetadata | null;
  created_at: string;
}