import type { CompanyUser } from "../types/user";

export const mockCompanyUsers: CompanyUser[] = [
  {
    id: "USR-001",
    name: "Jhonny Bastidas",
    email: "jhonny@empresa.com",
    role: "owner",
    status: "active",
    lastAccess: "Hoy, 09:12",
    createdAt: "01 Jul 2026",
  },
  {
    id: "USR-002",
    name: "María Gómez",
    email: "maria@empresa.com",
    role: "admin",
    status: "active",
    lastAccess: "Ayer, 16:40",
    createdAt: "30 Jun 2026",
  },
  {
    id: "USR-003",
    name: "Carlos Rivera",
    email: "carlos@empresa.com",
    role: "operator",
    status: "pending",
    lastAccess: "Sin acceso",
    createdAt: "29 Jun 2026",
  },
];