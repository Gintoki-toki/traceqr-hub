import { jsPDF } from "jspdf";
import QRCode from "qrcode";

import type { TraceQrCsvImportResult } from "../imports/traceQrCsvImportService";

function sanitizeFileName(value: string) {
  return value
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function validateImportedBatch(importedBatch: TraceQrCsvImportResult) {
  if (!importedBatch.rows.length) {
    throw new Error("El CSV importado no tiene códigos QR.");
  }

  if (!importedBatch.batchId) {
    throw new Error("El CSV no tiene batch_id.");
  }

  if (!importedBatch.companyId) {
    throw new Error("El CSV no tiene company_id.");
  }

  if ((importedBatch.strategy || "batch_hash") !== "batch_hash") {
    throw new Error("El CSV no usa la estrategia batch_hash.");
  }
}

function getImportedPdfFileName(importedBatch: TraceQrCsvImportResult) {
  const batchName = sanitizeFileName(importedBatch.batchName || "lote-traceqr");
  const productName = sanitizeFileName(importedBatch.productName || "producto");

  return `traceqrhub_${batchName}_${productName}.pdf`;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function pauseBrowser() {
  await sleep(0);
}

async function createImportedTraceQrPdf(importedBatch: TraceQrCsvImportResult) {
  validateImportedBatch(importedBatch);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 8;
  const headerHeight = 22;

  const columns = 4;
  const rows = 5;
  const qrPerPage = columns * rows;

  const usableWidth = pageWidth - margin * 2;
  const cellWidth = usableWidth / columns;
  const cellHeight = 52;
  const qrSize = 30;

  function drawHeader(pageNumber: number) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("TraceQrHub - Impresión desde CSV TraceQR", margin, 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`Lote: ${importedBatch.batchName || "Sin lote"}`, margin, 14);
    pdf.text(`Producto: ${importedBatch.productName || "Sin producto"}`, margin, 18);
    pdf.text(`Total QR: ${importedBatch.total}`, margin, 22);

    pdf.text(`Página: ${pageNumber}`, pageWidth - margin, 10, {
      align: "right",
    });
  }

  drawHeader(1);

  for (let i = 0; i < importedBatch.rows.length; i++) {
    const qrRow = importedBatch.rows[i];
    const positionInPage = i % qrPerPage;

    if (i > 0 && positionInPage === 0) {
      pdf.addPage();
      drawHeader(Math.floor(i / qrPerPage) + 1);
    }

    const column = positionInPage % columns;
    const row = Math.floor(positionInPage / columns);

    const cellX = margin + column * cellWidth;
    const cellY = headerHeight + row * cellHeight + 5;

    const qrImage = await QRCode.toDataURL(qrRow.qr_url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 180,
    });

    const qrX = cellX + (cellWidth - qrSize) / 2;
    const qrY = cellY;

    pdf.addImage(qrImage, "PNG", qrX, qrY, qrSize, qrSize);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.text(qrRow.short_code, cellX + cellWidth / 2, qrY + qrSize + 4, {
      align: "center",
      maxWidth: cellWidth - 4,
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(5.5);
    pdf.text(
      importedBatch.productName || importedBatch.batchName || "TraceQR",
      cellX + cellWidth / 2,
      qrY + qrSize + 8,
      {
        align: "center",
        maxWidth: cellWidth - 4,
      }
    );

    if (importedBatch.productBrand) {
      pdf.text(
        importedBatch.productBrand,
        cellX + cellWidth / 2,
        qrY + qrSize + 12,
        {
          align: "center",
          maxWidth: cellWidth - 4,
        }
      );
    }

    if (i % 50 === 0) {
      await pauseBrowser();
    }
  }

  return pdf;
}

export async function downloadImportedTraceQrPdf(
  importedBatch: TraceQrCsvImportResult
) {
  const pdf = await createImportedTraceQrPdf(importedBatch);

  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = getImportedPdfFileName(importedBatch);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 60000);
}

export async function printImportedTraceQrPdf(
  importedBatch: TraceQrCsvImportResult
) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error(
      "El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio."
    );
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Preparando PDF...</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 32px;">
        <h2>Generando PDF de TraceQrHub...</h2>
        <p>Espera unos segundos. No cierres esta ventana.</p>
      </body>
    </html>
  `);

  printWindow.document.close();

  const pdf = await createImportedTraceQrPdf(importedBatch);
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  printWindow.location.href = pdfUrl;

  window.setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // Si el navegador no permite imprimir automáticamente,
      // el PDF queda abierto para imprimir manualmente.
    }
  }, 1800);

  window.setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 60000);
}