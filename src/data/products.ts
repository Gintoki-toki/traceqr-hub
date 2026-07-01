import type { Product } from "../types/product";

export const mockProducts: Product[] = [
  {
    id: "PROD-001",
    name: "Café Premium 500g",
    sku: "CAF-PREM-500",
    description: "Café tostado de origen colombiano en presentación de 500 gramos.",
    category: "Alimentos",
    status: "active",
    createdAt: "01 Jul 2026",
  },
  {
    id: "PROD-002",
    name: "Panela Orgánica",
    sku: "PAN-ORG-001",
    description: "Panela orgánica empacada para distribución nacional.",
    category: "Alimentos",
    status: "active",
    createdAt: "30 Jun 2026",
  },
  {
    id: "PROD-003",
    name: "Miel Natural",
    sku: "MIEL-NAT-250",
    description: "Miel natural en frasco de vidrio de 250 ml.",
    category: "Alimentos",
    status: "inactive",
    createdAt: "29 Jun 2026",
  },
];