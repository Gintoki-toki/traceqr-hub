import { supabase } from "../../config/supabase";
import type {
  CompanyMemberProfile,
  CompanyProfile,
} from "../../types/companyProfile";

export interface CurrentCompanyProfile {
  company: CompanyProfile | null;
  member: CompanyMemberProfile | null;
}

export async function getCurrentCompanyProfile(
  userId: string
): Promise<CurrentCompanyProfile> {
  const { data: member, error: memberError } = await supabase
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
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    return {
      company: null,
      member: null,
    };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select(
      `
      id,
      name,
      email,
      tax_id,
      industry,
      logo_url,
      status,
      created_at,
      updated_at
    `
    )
    .eq("id", member.company_id)
    .maybeSingle();

  if (companyError) {
    throw new Error(companyError.message);
  }

  return {
    company: company as CompanyProfile | null,
    member: member as CompanyMemberProfile,
  };
}