import type { Company, CompanySettings } from "../types/company";

export const mockCompany: Company = {
  id: "COMP-001",
  name: "Empresa demo",
  email: "contacto@empresademo.com",
  taxId: "900123456-7",
  industry: "Alimentos y bebidas",
  country: "Colombia",
  city: "Cali",
  status: "active",
  createdAt: "01 Jul 2026",
};

export const mockCompanySettings: CompanySettings = {
  defaultPdfTemplate: "A4 estándar",
  defaultQrQuantity: 500,
  allowPdfDownload: true,
  allowDirectPrint: true,
  notifyOnBatchCreated: true,
};