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
    pdf.text(
      `Producto: ${importedBatch.productName || "Sin producto"}`,
      margin,
      18
    );
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  validateImportedBatch(importedBatch);

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
        <title>Impresión TraceQrHub</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 12mm;
            font-family: Arial, sans-serif;
            color: #111827;
            background: white;
          }

          .header {
            margin-bottom: 8mm;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 4mm;
          }

          .header h1 {
            margin: 0 0 2mm;
            font-size: 16px;
          }

          .header p {
            margin: 1mm 0;
            font-size: 10px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5mm 4mm;
          }

          .qr-card {
            break-inside: avoid;
            page-break-inside: avoid;
            text-align: center;
            border: 1px dashed #d1d5db;
            padding: 3mm 2mm;
            min-height: 45mm;
          }

          .qr-card img {
            width: 30mm;
            height: 30mm;
            object-fit: contain;
          }

          .short-code {
            margin-top: 2mm;
            font-size: 9px;
            font-weight: bold;
          }

          .product {
            margin-top: 1mm;
            font-size: 7px;
          }

          .brand {
            margin-top: 1mm;
            font-size: 7px;
            color: #4b5563;
          }

          .loading {
            font-size: 14px;
            padding: 32px;
          }

          @page {
            size: A4;
            margin: 8mm;
          }

          @media print {
            body {
              padding: 0;
            }

            .no-print {
              display: none;
            }

            .header {
              break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="loading">
          Generando vista de impresión de TraceQrHub... Espera unos segundos.
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  const qrItems: string[] = [];

  for (let i = 0; i < importedBatch.rows.length; i++) {
    const row = importedBatch.rows[i];

    const qrImage = await QRCode.toDataURL(row.qr_url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 180,
    });

    qrItems.push(`
      <div class="qr-card">
        <img src="${qrImage}" alt="${escapeHtml(row.short_code)}" />
        <div class="short-code">${escapeHtml(row.short_code)}</div>
        <div class="product">${escapeHtml(
          importedBatch.productName || importedBatch.batchName || "TraceQR"
        )}</div>
        ${
          importedBatch.productBrand
            ? `<div class="brand">${escapeHtml(importedBatch.productBrand)}</div>`
            : ""
        }
      </div>
    `);

    if (i % 50 === 0) {
      await pauseBrowser();
    }
  }

  printWindow.document.body.innerHTML = `
    <div class="header">
      <h1>TraceQrHub - Impresión desde CSV TraceQR</h1>
      <p><strong>Lote:</strong> ${escapeHtml(
        importedBatch.batchName || "Sin lote"
      )}</p>
      <p><strong>Producto:</strong> ${escapeHtml(
        importedBatch.productName || "Sin producto"
      )}</p>
      <p><strong>Marca:</strong> ${escapeHtml(
        importedBatch.productBrand || "Sin marca"
      )}</p>
      <p><strong>Total QR:</strong> ${importedBatch.total.toLocaleString(
        "es-CO"
      )}</p>
    </div>

    <div class="grid">
      ${qrItems.join("")}
    </div>
  `;

  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 800);
}