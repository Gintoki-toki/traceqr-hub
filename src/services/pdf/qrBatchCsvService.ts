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

function sanitizeCsvValue(value: string | number | null | undefined) {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}

function sanitizeFileName(value: string) {
  return value
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function buildQrRow(batch: QRBatch, index: number) {
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

  const qrUrl = `${getScanBaseUrl()}?${params.toString()}`;

  return {
    index,
    shortCode,
    batchCode: batch.batch_code,
    batchName: batch.name,
    productName: batch.product?.name ?? "",
    productSku: batch.product?.sku ?? "",
    token,
    qrUrl,
  };
}

export async function downloadBatchCsv(batch: QRBatch) {
  if (batch.status !== "generated") {
    throw new Error("Solo puedes descargar CSV de lotes generados.");
  }

  if (!batch.batch_hash) {
    throw new Error("El lote no tiene batch_hash.");
  }

  if (batch.quantity <= 0) {
    throw new Error("La cantidad del lote no es válida.");
  }

  const headers = [
    "index",
    "short_code",
    "batch_code",
    "batch_name",
    "product_name",
    "product_sku",
    "token",
    "qr_url",
  ];

  const rows = [headers.map(sanitizeCsvValue).join(",")];

  for (let index = 1; index <= batch.quantity; index++) {
    const row = await buildQrRow(batch, index);

    rows.push(
      [
        row.index,
        row.shortCode,
        row.batchCode,
        row.batchName,
        row.productName,
        row.productSku,
        row.token,
        row.qrUrl,
      ]
        .map(sanitizeCsvValue)
        .join(",")
    );
  }

  const csvContent = rows.join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const fileName = `${sanitizeFileName(batch.batch_code)}-${sanitizeFileName(
    batch.product?.name ?? "producto"
  )}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}