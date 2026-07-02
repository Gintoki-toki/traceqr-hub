import { jsPDF } from "jspdf";
import QRCode from "qrcode";

import type { QRBatch } from "../../types/batch";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha512(message: string) {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-512", encoder.encode(message));

  return toHex(hash);
}

function getScanBaseUrl() {
  return import.meta.env.VITE_TRACEQR_SCAN_BASE_URL ?? "https://traceqr.app/scan";
}

function getShortCode(batch: QRBatch, index: number) {
  const paddedIndex = String(index).padStart(6, "0");

  return `${batch.batch_code}-${paddedIndex}`;
}

async function buildQrUrl(batch: QRBatch, index: number) {
  if (!batch.batch_hash) {
    throw new Error("El lote no tiene hash generado.");
  }

  const shortCode = getShortCode(batch, index);

  const tokenSeed = [
    batch.batch_hash,
    batch.batch_code,
    shortCode,
    String(index),
  ].join(":");

  const token = await sha512(tokenSeed);

  const params = new URLSearchParams({
    token,
    batch: batch.batch_code,
    code: shortCode,
  });

  return {
    shortCode,
    token,
    url: `${getScanBaseUrl()}?${params.toString()}`,
  };
}

function sanitizeFileName(value: string) {
  return value
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function validateBatchForPdf(batch: QRBatch) {
  if (batch.status !== "generated") {
    throw new Error("Solo puedes generar PDF de lotes generados.");
  }

  if (!batch.batch_hash) {
    throw new Error("El lote no tiene batch_hash.");
  }

  if (batch.quantity <= 0) {
    throw new Error("La cantidad del lote no es válida.");
  }
}

function getBatchPdfFileName(batch: QRBatch) {
  return `${sanitizeFileName(batch.batch_code)}-${sanitizeFileName(
    batch.product?.name ?? "producto"
  )}.pdf`;
}

async function createBatchPdf(batch: QRBatch) {
  validateBatchForPdf(batch);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 8;
  const headerHeight = 18;

  const columns = 4;
  const rows = 5;
  const perPage = columns * rows;

  const usableWidth = pageWidth - margin * 2;
  const cellWidth = usableWidth / columns;
  const cellHeight = 52;
  const qrSize = 30;

  function drawHeader(pageNumber: number) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("TraceQrHub - Lote QR", margin, 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`Lote: ${batch.batch_code}`, margin, 14);
    pdf.text(`Producto: ${batch.product?.name ?? "Sin producto"}`, margin, 18);
    pdf.text(`Página: ${pageNumber}`, pageWidth - margin, 10, {
      align: "right",
    });
  }

  drawHeader(1);

  for (let index = 1; index <= batch.quantity; index++) {
    const zeroBasedIndex = index - 1;
    const positionInPage = zeroBasedIndex % perPage;

    if (zeroBasedIndex > 0 && positionInPage === 0) {
      pdf.addPage();
      drawHeader(Math.floor(zeroBasedIndex / perPage) + 1);
    }

    const column = positionInPage % columns;
    const row = Math.floor(positionInPage / columns);

    const cellX = margin + column * cellWidth;
    const cellY = headerHeight + row * cellHeight + 5;

    const { shortCode, url } = await buildQrUrl(batch, index);

    const qrImage = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 180,
    });

    const qrX = cellX + (cellWidth - qrSize) / 2;
    const qrY = cellY;

    pdf.addImage(qrImage, "PNG", qrX, qrY, qrSize, qrSize);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.text(shortCode, cellX + cellWidth / 2, qrY + qrSize + 4, {
      align: "center",
      maxWidth: cellWidth - 4,
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(5.5);
    pdf.text(
      batch.product?.sku ?? "Sin SKU",
      cellX + cellWidth / 2,
      qrY + qrSize + 8,
      {
        align: "center",
        maxWidth: cellWidth - 4,
      }
    );
  }

  return pdf;
}

export async function downloadBatchPdf(batch: QRBatch) {
  const pdf = await createBatchPdf(batch);

  pdf.save(getBatchPdfFileName(batch));
}

export async function printBatchPdf(batch: QRBatch) {
  const pdf = await createBatchPdf(batch);
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const printWindow = window.open(pdfUrl, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(pdfUrl);
    throw new Error(
      "El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio."
    );
  }

  const printDelayInMs = 1200;

  window.setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // Algunos navegadores no permiten lanzar print automáticamente
      // sobre el visor PDF, pero el archivo queda abierto en una pestaña.
    }
  }, printDelayInMs);

  window.setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 60000);
}