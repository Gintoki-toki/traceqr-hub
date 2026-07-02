import { supabase } from "../../config/supabase";
import type { QREvent } from "../../types/qrEvent";

export async function getCompanyQrEvents(companyId: string): Promise<QREvent[]> {
  const { data, error } = await supabase
    .from("qr_events")
    .select(
      `
      id,
      company_id,
      batch_id,
      qr_code_id,
      event_type,
      metadata,
      created_at
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as QREvent[];
}