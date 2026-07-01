export type HistoryEventType =
  | "batch_created"
  | "qr_generated"
  | "pdf_downloaded"
  | "pdf_printed"
  | "batch_failed";

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  batchCode: string;
  productName: string;
  quantity: number;
  user: string;
  date: string;
  time: string;
}