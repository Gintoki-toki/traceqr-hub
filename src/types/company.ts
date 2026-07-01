export interface Company {
  id: string;
  name: string;
  email: string;
  taxId: string;
  industry: string;
  country: string;
  city: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface CompanySettings {
  defaultPdfTemplate: string;
  defaultQrQuantity: number;
  allowPdfDownload: boolean;
  allowDirectPrint: boolean;
  notifyOnBatchCreated: boolean;
}