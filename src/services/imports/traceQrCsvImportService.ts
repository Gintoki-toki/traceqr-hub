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

const REQUIRED_COLUMNS = [
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

function validateQrUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    const batch = parsedUrl.searchParams.get("batch");
    const index = parsedUrl.searchParams.get("index");
    const token = parsedUrl.searchParams.get("token");

    return Boolean(batch && index && token && validateToken(token));
  } catch {
    return false;
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

  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column)
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `El CSV no tiene las columnas requeridas: ${missingColumns.join(", ")}`
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

    const index = Number(record.index);

    if (!record.batch_id) {
      throw new Error(`Fila ${rowIndex + 2}: falta batch_id.`);
    }

    if (!record.company_id) {
      throw new Error(`Fila ${rowIndex + 2}: falta company_id.`);
    }

    if (!record.short_code) {
      throw new Error(`Fila ${rowIndex + 2}: falta short_code.`);
    }

    if (!Number.isInteger(index) || index < 1) {
      throw new Error(`Fila ${rowIndex + 2}: index inválido.`);
    }

    if (!validateToken(record.token)) {
      throw new Error(`Fila ${rowIndex + 2}: token inválido.`);
    }

    if (!validateQrUrl(record.qr_url)) {
      throw new Error(`Fila ${rowIndex + 2}: qr_url inválida.`);
    }

    return {
      batch_id: record.batch_id,
      batch_name: record.batch_name,
      company_id: record.company_id,
      index,
      short_code: record.short_code,
      qr_url: record.qr_url,
      token: record.token,
      product_name: record.product_name,
      product_brand: record.product_brand,
      container_type: record.container_type,
      status: record.status,
      strategy: record.strategy,
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

  for (const row of rows) {
    if (seenShortCodes.has(row.short_code)) {
      duplicatedShortCodes.add(row.short_code);
    }

    seenShortCodes.add(row.short_code);
  }

  if (duplicatedShortCodes.size > 0) {
    throw new Error(
      `El CSV tiene short_code duplicados: ${Array.from(duplicatedShortCodes)
        .slice(0, 5)
        .join(", ")}`
    );
  }

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