import { supabase } from "../../config/supabase";
import type { CompanyMemberProfile } from "../../types/companyProfile";

export type InviteCompanyMemberRole = "admin" | "operator";

export interface InviteCompanyMemberPayload {
  companyId: string;
  email: string;
  displayName: string;
  role: InviteCompanyMemberRole;
  password: string;
}

export interface InviteCompanyMemberResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
  member?: CompanyMemberProfile;
}

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

export async function inviteCompanyMember(
  payload: InviteCompanyMemberPayload
): Promise<CompanyMemberProfile> {
  const { data, error } =
    await supabase.functions.invoke<InviteCompanyMemberResponse>(
      "invite-company-member",
      {
        body: payload,
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success || !data.member) {
    throw new Error(data?.error ?? "No se pudo invitar el usuario.");
  }

  return data.member;
}