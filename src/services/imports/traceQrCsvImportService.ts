export interface TraceQrCsvRow {
  batch_id: string;
  batch_name: string;
  company_id: string;
  index: number;
  short_code: string;
  qr_url: string;
  token: string;
  product_name: string;
  product_brand: string;
  container_type: string;
  status: string;
  strategy: string;
}

export interface TraceQrCsvImportResult {
  batchId: string;
  batchName: string;
  companyId: string;
  productName: string;
  productBrand: string;
  containerType: string;
  strategy: string;
  total: number;
  rows: TraceQrCsvRow[];
}

const FULL_FORMAT_COLUMNS = [
  "batch_id",
  "batch_name",
  "company_id",
  "index",
  "short_code",
  "qr_url",
  "token",
  "product_name",
  "product_brand",
  "container_type",
  "status",
  "strategy",
];

const LEGACY_FORMAT_COLUMNS = [
  "short_code",
  "qr_url",
  "ucid_hash",
  "product_name",
  "product_brand",
  "status",
];

interface QrUrlData {
  batchId: string;
  index: number;
  token: string;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);

  return values.map((value) => value.trim());
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function validateToken(token: string) {
  return /^[a-f0-9]{128}$/i.test(token);
}

function getMissingColumns(headers: string[], requiredColumns: string[]) {
  return requiredColumns.filter((column) => !headers.includes(column));
}

function hasColumns(headers: string[], requiredColumns: string[]) {
  return getMissingColumns(headers, requiredColumns).length === 0;
}

function extractQrUrlData(url: string): QrUrlData | null {
  try {
    const parsedUrl = new URL(url);

    const batchId = parsedUrl.searchParams.get("batch");
    const indexValue = parsedUrl.searchParams.get("index");
    const token = parsedUrl.searchParams.get("token");

    const index = Number(indexValue);

    if (!batchId) return null;
    if (!Number.isInteger(index) || index < 1) return null;
    if (!token || !validateToken(token)) return null;

    return {
      batchId,
      index,
      token,
    };
  } catch {
    return null;
  }
}

export async function importTraceQrCsvFile(
  file: File
): Promise<TraceQrCsvImportResult> {
  const text = await file.text();

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("El CSV está vacío o no tiene registros de QR.");
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  const isFullFormat = hasColumns(headers, FULL_FORMAT_COLUMNS);
  const isLegacyFormat = hasColumns(headers, LEGACY_FORMAT_COLUMNS);

  if (!isFullFormat && !isLegacyFormat) {
    const missingFullColumns = getMissingColumns(headers, FULL_FORMAT_COLUMNS);
    const missingLegacyColumns = getMissingColumns(
      headers,
      LEGACY_FORMAT_COLUMNS
    );

    throw new Error(
      [
        "El CSV no tiene un formato compatible.",
        `Formato nuevo, faltan: ${missingFullColumns.join(", ")}`,
        `Formato anterior, faltan: ${missingLegacyColumns.join(", ")}`,
      ].join(" ")
    );
  }

  const rows: TraceQrCsvRow[] = lines.slice(1).map((line, rowIndex) => {
    const values = parseCsvLine(line);

    const record = headers.reduce<Record<string, string>>(
      (acc, header, index) => {
        acc[header] = values[index] ?? "";
        return acc;
      },
      {}
    );

    const qrUrlData = extractQrUrlData(record.qr_url);

    if (!record.qr_url || !qrUrlData) {
      throw new Error(`Fila ${rowIndex + 2}: qr_url inválida.`);
    }

    const batchId = record.batch_id || qrUrlData.batchId;
    const batchName = record.batch_name || `Lote ${batchId.slice(0, 8)}`;
    const companyId = record.company_id || "No incluido en CSV";
    const index = record.index ? Number(record.index) : qrUrlData.index;
    const shortCode = record.short_code;
    const token = record.token || record.ucid_hash || qrUrlData.token;
    const productName = record.product_name || "";
    const productBrand = record.product_brand || "";
    const containerType = record.container_type || "No especificado";
    const status = record.status || "unused";
    const strategy = record.strategy || "batch_hash";

    if (!batchId) {
      throw new Error(`Fila ${rowIndex + 2}: falta batch_id.`);
    }

    if (!shortCode) {
      throw new Error(`Fila ${rowIndex + 2}: falta short_code.`);
    }

    if (!Number.isInteger(index) || index < 1) {
      throw new Error(`Fila ${rowIndex + 2}: index inválido.`);
    }

    if (!validateToken(token)) {
      throw new Error(`Fila ${rowIndex + 2}: token inválido.`);
    }

    if (token.toLowerCase() !== qrUrlData.token.toLowerCase()) {
      throw new Error(
        `Fila ${rowIndex + 2}: el token no coincide con el token de qr_url.`
      );
    }

    if (batchId !== qrUrlData.batchId) {
      throw new Error(
        `Fila ${rowIndex + 2}: el batch_id no coincide con el batch de qr_url.`
      );
    }

    if (index !== qrUrlData.index) {
      throw new Error(
        `Fila ${rowIndex + 2}: el index no coincide con el index de qr_url.`
      );
    }

    return {
      batch_id: batchId,
      batch_name: batchName,
      company_id: companyId,
      index,
      short_code: shortCode,
      qr_url: record.qr_url,
      token,
      product_name: productName,
      product_brand: productBrand,
      container_type: containerType,
      status,
      strategy,
    };
  });

  if (rows.length === 0) {
    throw new Error("El CSV no contiene códigos QR.");
  }

  const firstRow = rows[0];

  const differentBatch = rows.find((row) => row.batch_id !== firstRow.batch_id);

  if (differentBatch) {
    throw new Error(
      "El CSV contiene códigos de más de un lote. Importa un lote a la vez."
    );
  }

  const seenShortCodes = new Set<string>();
  const duplicatedShortCodes = new Set<string>();

  const seenIndexes = new Set<number>();
  const duplicatedIndexes = new Set<number>();

  for (const row of rows) {
    if (seenShortCodes.has(row.short_code)) {
      duplicatedShortCodes.add(row.short_code);
    }

    seenShortCodes.add(row.short_code);

    if (seenIndexes.has(row.index)) {
      duplicatedIndexes.add(row.index);
    }

    seenIndexes.add(row.index);
  }

  if (duplicatedShortCodes.size > 0) {
    throw new Error(
      `El CSV tiene short_code duplicados: ${Array.from(duplicatedShortCodes)
        .slice(0, 5)
        .join(", ")}`
    );
  }

  if (duplicatedIndexes.size > 0) {
    throw new Error(
      `El CSV tiene index duplicados: ${Array.from(duplicatedIndexes)
        .slice(0, 5)
        .join(", ")}`
    );
  }

  rows.sort((a, b) => a.index - b.index);

  return {
    batchId: firstRow.batch_id,
    batchName: firstRow.batch_name,
    companyId: firstRow.company_id,
    productName: firstRow.product_name,
    productBrand: firstRow.product_brand,
    containerType: firstRow.container_type,
    strategy: firstRow.strategy || "batch_hash",
    total: rows.length,
    rows,
  };
}