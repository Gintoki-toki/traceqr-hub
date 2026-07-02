import { supabase } from "../../config/supabase";
import type { CompanyMemberProfile } from "../../types/companyProfile";

export async function getCompanyMembers(
  companyId: string
): Promise<CompanyMemberProfile[]> {
  const { data, error } = await supabase
    .from("company_members")
    .select(
      `
      id,
      company_id,
      user_id,
      email,
      display_name,
      role,
      status,
      created_at,
      updated_at
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CompanyMemberProfile[];
}