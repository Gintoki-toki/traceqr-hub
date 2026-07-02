import { supabase } from "../../config/supabase";

export interface RegisterCompanyPayload {
  companyName: string;
  companyEmail: string;
  password: string;
  ownerName: string;
  taxId?: string;
  industry?: string;
}

export interface RegisterCompanyResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export async function registerCompany(payload: RegisterCompanyPayload) {
  const { data, error } =
    await supabase.functions.invoke<RegisterCompanyResponse>(
      "register-company",
      {
        body: payload,
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.error ?? "No se pudo registrar la empresa");
  }

  return data;
}