export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  pageSize: "A4" | "Letter";
  columns: number;
  rows: number;
  codesPerPage: number;
}