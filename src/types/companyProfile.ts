export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  tax_id: string | null;
  industry: string | null;
  logo_url: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface CompanyMemberProfile {
  id: string;
  company_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: "owner" | "admin" | "operator";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}