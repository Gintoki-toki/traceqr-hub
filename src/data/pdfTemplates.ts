import type { PDFTemplate } from "../types/pdf";

export const mockPDFTemplates: PDFTemplate[] = [
  {
    id: "a4-standard",
    name: "A4 estándar",
    description: "12 códigos QR por página, ideal para impresión general.",
    pageSize: "A4",
    columns: 3,
    rows: 4,
    codesPerPage: 12,
  },
  {
    id: "a4-compact",
    name: "A4 compacto",
    description: "20 códigos QR por página, útil para lotes grandes.",
    pageSize: "A4",
    columns: 4,
    rows: 5,
    codesPerPage: 20,
  },
  {
    id: "label-sheet",
    name: "Etiquetas adhesivas",
    description: "50 códigos QR por página, pensado para etiquetas pequeñas.",
    pageSize: "A4",
    columns: 5,
    rows: 10,
    codesPerPage: 50,
  },
];