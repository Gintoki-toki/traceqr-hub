import type { ChangeEvent } from "react";
import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  Layers,
  Loader2,
  Package,
  Printer,
  QrCode,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card/Card";

import {
  importTraceQrCsvFile,
  type TraceQrCsvImportResult,
} from "../../services/imports/traceQrCsvImportService";
import {
  downloadImportedTraceQrPdf,
  printImportedTraceQrPdf,
} from "../../services/pdf/traceQrImportedPdfService";

function estimatePdfPages(quantity: number) {
  const qrPerPage = 20;

  if (quantity <= 0) return 0;

  return Math.ceil(quantity / qrPerPage);
}

function shortId(value: string) {
  if (!value) return "No disponible";

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export default function GeneratePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [importedBatch, setImportedBatch] =
    useState<TraceQrCsvImportResult | null>(null);

  const [csvFileName, setCsvFileName] = useState("");

  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const pages = useMemo(() => {
    return estimatePdfPages(importedBatch?.total ?? 0);
  }, [importedBatch]);

  const previewRows = useMemo(() => {
    return importedBatch?.rows.slice(0, 5) ?? [];
  }, [importedBatch]);

  async function handleImportCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Selecciona un archivo CSV válido.");
      event.target.value = "";
      return;
    }

    try {
      setIsImportingCsv(true);
      setErrorMessage("");
      setSuccessMessage("");
      setImportedBatch(null);

      const result = await importTraceQrCsvFile(file);

      setImportedBatch(result);
      setCsvFileName(file.name);

      setSuccessMessage(
        `CSV importado correctamente. Se cargaron ${result.total.toLocaleString(
          "es-CO"
        )} QR para generar PDF.`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo importar el CSV de TraceQR."
      );
    } finally {
      setIsImportingCsv(false);
      event.target.value = "";
    }
  }

  async function handleDownloadPdf() {
    if (!importedBatch) {
      setErrorMessage("Primero importa un CSV de TraceQR.");
      return;
    }

    try {
      setIsDownloadingPdf(true);
      setErrorMessage("");
      setSuccessMessage("");

      await downloadImportedTraceQrPdf(importedBatch);

      setSuccessMessage("PDF generado correctamente desde el CSV importado.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo descargar el PDF."
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function handlePreparePrint() {
    if (!importedBatch) {
      setErrorMessage("Primero importa un CSV de TraceQR.");
      return;
    }

    try {
      setIsPreparingPrint(true);
      setErrorMessage("");
      setSuccessMessage("");

      await printImportedTraceQrPdf(importedBatch);

      setSuccessMessage("PDF abierto para impresión desde el CSV importado.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo preparar la impresión."
      );
    } finally {
      setIsPreparingPrint(false);
    }
  }

  function handleClearImport() {
    setImportedBatch(null);
    setCsvFileName("");
    setErrorMessage("");
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Generar QR
            </h1>

            <p className="mt-2 text-slate-400">
              Importa el CSV generado en TraceQR y conviértelo en PDF o formato
              de impresión desde TraceQrHub.
            </p>
          </div>

          <Badge variant="info">CSV TraceQR → PDF</Badge>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Importar CSV de TraceQR</CardTitle>

              <CardDescription>
                Este flujo no crea lotes en la base de datos de TraceQrHub. Solo
                lee el CSV exportado desde TraceQR y genera los PDF de impresión.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleImportCsv}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImportingCsv}
                  className="w-full rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-400/10 p-10 text-center transition hover:border-cyan-300/70 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/20">
                    {isImportingCsv ? (
                      <Loader2 className="h-7 w-7 animate-spin text-cyan-300" />
                    ) : (
                      <UploadCloud className="h-7 w-7 text-cyan-300" />
                    )}
                  </div>

                  <p className="mt-4 font-semibold text-white">
                    {isImportingCsv
                      ? "Importando CSV..."
                      : "Seleccionar CSV exportado desde TraceQR"}
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Debe contener batch_id, company_id, short_code, qr_url,
                    token y strategy.
                  </p>
                </button>

                {csvFileName && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="text-sm font-medium text-white">
                          {csvFileName}
                        </p>

                        <p className="text-xs text-slate-500">
                          Archivo cargado en memoria, no guardado en base de
                          datos.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearImport}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      aria-label="Quitar CSV importado"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <ShieldCheck className="h-5 w-5 text-cyan-300" />

                    <p className="mt-3 font-medium text-white">
                      Sin sobrecargar Supabase
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      TraceQrHub no inserta los QR en tablas. Solo usa el CSV
                      para generar el PDF.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <QrCode className="h-5 w-5 text-cyan-300" />

                    <p className="mt-3 font-medium text-white">
                      Validación en TraceQR
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Los QR impresos serán validados por TraceQR al escanearse,
                      no por TraceQrHub.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />

                    <div>
                      <p className="font-medium text-cyan-100">
                        Flujo correcto entre aplicaciones
                      </p>

                      <p className="mt-1 text-sm text-cyan-200/80">
                        TraceQR registra el lote y exporta el CSV. TraceQrHub
                        importa ese CSV y genera el PDF o la impresión.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista previa</CardTitle>

                <CardDescription>
                  Resumen del lote importado desde TraceQR.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!importedBatch ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-400">
                    Todavía no has importado un CSV de TraceQR.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-cyan-300" />

                        <div>
                          <p className="text-sm text-slate-400">Producto</p>

                          <p className="font-semibold text-white">
                            {importedBatch.productName || "Sin producto"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {importedBatch.productBrand || "Sin marca"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center gap-3">
                        <Layers className="h-5 w-5 text-cyan-300" />

                        <div>
                          <p className="text-sm text-slate-400">Lote</p>

                          <p className="font-semibold text-white">
                            {importedBatch.batchName || "Sin nombre"}
                          </p>

                          <p className="text-xs text-slate-500">
                            ID: {shortId(importedBatch.batchId)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <QrCode className="h-5 w-5 text-cyan-300" />

                        <p className="mt-3 text-sm text-slate-400">
                          QR importados
                        </p>

                        <p className="mt-1 text-3xl font-bold text-white">
                          {importedBatch.total.toLocaleString("es-CO")}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <FileText className="h-5 w-5 text-cyan-300" />

                        <p className="mt-3 text-sm text-slate-400">
                          Páginas PDF estimadas
                        </p>

                        <p className="mt-1 text-3xl font-bold text-white">
                          {pages}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm text-slate-400">Empresa origen</p>

                      <p className="mt-2 break-all font-mono text-xs text-cyan-200">
                        {importedBatch.companyId}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm text-slate-400">
                        Primeros QR del CSV
                      </p>

                      <div className="mt-3 space-y-2">
                        {previewRows.map((row) => (
                          <div
                            key={`${row.batch_id}-${row.index}`}
                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-3 py-2"
                          >
                            <div>
                              <p className="font-mono text-xs text-white">
                                {row.short_code}
                              </p>

                              <p className="text-xs text-slate-500">
                                Fila {row.index}
                              </p>
                            </div>

                            <Badge variant="success">
                              {row.strategy || "batch_hash"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>

                <CardDescription>
                  Cuando el CSV esté importado podrás generar el PDF o abrir la
                  impresión.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!importedBatch ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-400">
                    Aún no hay un lote importado para generar PDF.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />

                        <div>
                          <p className="font-medium text-emerald-100">
                            CSV listo para impresión
                          </p>

                          <p className="mt-1 text-sm text-emerald-200/80">
                            {importedBatch.total.toLocaleString("es-CO")} QR
                            cargados desde TraceQR. No se guardaron registros
                            individuales en TraceQrHub.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                      >
                        {isDownloadingPdf ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            PDF...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isPreparingPrint}
                        onClick={handlePreparePrint}
                      >
                        {isPreparingPrint ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Abriendo...
                          </>
                        ) : (
                          <>
                            <Printer className="mr-2 h-4 w-4" />
                            Abrir impresión
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}