export type CompanyUserRole = "owner" | "admin" | "operator";
export type CompanyUserStatus = "active" | "inactive" | "pending";

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: CompanyUserRole;
  status: CompanyUserStatus;
  lastAccess: string;
  createdAt: string;
}