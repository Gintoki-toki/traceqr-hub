import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Download,
  FileText,
  Loader2,
  PlayCircle,
  Plus,
  Printer,
  QrCode,
  Search,
  X,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card/Card";

import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import type { BatchStatus, QRBatch } from "../../types/batch";
import type { Product } from "../../types/product";
import {
  createBatch,
  generateBatchHash,
  getCompanyBatches,
} from "../../services/batches/batchService";
import { getCompanyProducts } from "../../services/products/productService";
import {
  downloadBatchPdf,
  printBatchPdf,
} from "../../services/pdf/qrBatchPdfService";
import { downloadBatchCsv } from "../../services/pdf/qrBatchCsvService";
import { registerBatchExportEvent } from "../../services/history/createQrEventService";

function getStatusLabel(status: BatchStatus) {
  const labels: Record<BatchStatus, string> = {
    generated: "Generado",
    processing: "Procesando",
    draft: "Borrador",
    failed: "Fallido",
  };

  return labels[status];
}

function getStatusVariant(status: BatchStatus) {
  const variants = {
    generated: "success",
    processing: "warning",
    draft: "default",
    failed: "danger",
  } as const;

  return variants[status];
}

function canExportBatch(batch: QRBatch) {
  return batch.status === "generated" && Boolean(batch.batch_hash);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BatchesPage() {
  const { user } = useAuth();
  const { company } = useCompany();

  const [batches, setBatches] = useState<QRBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [quantity, setQuantity] = useState(100);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingBatchId, setGeneratingBatchId] = useState<string | null>(
    null
  );
  const [downloadingPdfBatchId, setDownloadingPdfBatchId] = useState<
    string | null
  >(null);
  const [downloadingCsvBatchId, setDownloadingCsvBatchId] = useState<
    string | null
  >(null);
  const [printingBatchId, setPrintingBatchId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredBatches = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return batches;

    return batches.filter((batch) => {
      return (
        batch.batch_code.toLowerCase().includes(value) ||
        batch.name.toLowerCase().includes(value) ||
        batch.product?.name.toLowerCase().includes(value) ||
        batch.product?.sku.toLowerCase().includes(value)
      );
    });
  }, [batches, search]);

  const totalQr = batches.reduce(
    (total, batch) => total + batch.generated_count,
    0
  );

  const exportableBatches = batches.filter(canExportBatch).length;

  async function loadData() {
    if (!company?.id) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const [batchData, productData] = await Promise.all([
        getCompanyBatches(company.id),
        getCompanyProducts(company.id),
      ]);

      setBatches(batchData);
      setProducts(productData);

      if (productData.length > 0 && !productId) {
        setProductId(productData[0].id);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los lotes."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [company?.id]);

  async function handleCreateBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company?.id || !user?.id) {
      setErrorMessage("No se encontró la empresa o el usuario actual.");
      return;
    }

    if (!productId) {
      setErrorMessage("Selecciona un producto para crear el lote.");
      return;
    }

    if (!batchName.trim()) {
      setErrorMessage("Escribe un nombre para el lote.");
      return;
    }

    if (quantity <= 0) {
      setErrorMessage("La cantidad debe ser mayor a 0.");
      return;
    }

    if (quantity > 5000) {
      setErrorMessage("Por ahora el máximo recomendado es 5000 QR por lote.");
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const newBatch = await createBatch({
        companyId: company.id,
        userId: user.id,
        productId,
        name: batchName,
        quantity,
      });

      setBatches((currentBatches) => [newBatch, ...currentBatches]);

      setBatchName("");
      setQuantity(100);
      setShowForm(false);

      setSuccessMessage("Lote creado correctamente como borrador.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo crear el lote."
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleGenerateBatch(batchId: string) {
    try {
      setGeneratingBatchId(batchId);
      setErrorMessage("");
      setSuccessMessage("");

      await generateBatchHash(batchId);
      await loadData();

      setSuccessMessage(
        "Lote generado correctamente. Los QR se derivarán desde el hash del lote al crear el PDF o CSV."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo generar el lote."
      );
    } finally {
      setGeneratingBatchId(null);
    }
  }

  async function handleDownloadPdf(batch: QRBatch) {
    try {
      setDownloadingPdfBatchId(batch.id);
      setErrorMessage("");
      setSuccessMessage("");

      await downloadBatchPdf(batch);

      await registerBatchExportEvent({
        batch,
        eventType: "pdf_downloaded",
      });

      setSuccessMessage("PDF generado correctamente y registrado en el historial.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo generar el PDF."
      );
    } finally {
      setDownloadingPdfBatchId(null);
    }
  }

  async function handleDownloadCsv(batch: QRBatch) {
    try {
      setDownloadingCsvBatchId(batch.id);
      setErrorMessage("");
      setSuccessMessage("");

      await downloadBatchCsv(batch);

      await registerBatchExportEvent({
        batch,
        eventType: "csv_downloaded",
      });

      setSuccessMessage("CSV generado correctamente y registrado en el historial.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo generar el CSV."
      );
    } finally {
      setDownloadingCsvBatchId(null);
    }
  }

  async function handlePrintBatch(batch: QRBatch) {
    try {
      setPrintingBatchId(batch.id);
      setErrorMessage("");
      setSuccessMessage("");

      await printBatchPdf(batch);

      await registerBatchExportEvent({
        batch,
        eventType: "print_prepared",
      });

      setSuccessMessage(
        "Archivo de impresión abierto y registrado en el historial."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo preparar la impresión."
      );
    } finally {
      setPrintingBatchId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Lotes QR
            </h1>

            <p className="mt-2 text-slate-400">
              Consulta y crea lotes reales para {company?.name ?? "tu empresa"}.
            </p>
          </div>

          <Button type="button" onClick={() => setShowForm((value) => !value)}>
            {showForm ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo lote
              </>
            )}
          </Button>
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

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total lotes</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {batches.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Boxes className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">QR generados</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {totalQr.toLocaleString("es-CO")}
                </h2>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <QrCode className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Exportables</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {exportableBatches}
                </h2>

                <p className="mt-1 text-sm text-slate-500">PDF / CSV</p>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <FileText className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </section>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nuevo lote QR</CardTitle>

              <CardDescription>
                El lote quedará guardado en la tabla real{" "}
                <strong>qr_batches</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {products.length === 0 ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
                  Primero debes crear un producto en la sección Productos.
                </div>
              ) : (
                <form
                  onSubmit={handleCreateBatch}
                  className="grid gap-4 lg:grid-cols-4"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Producto
                    </label>

                    <select
                      value={productId}
                      onChange={(event) => setProductId(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {product.sku}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Nombre del lote"
                    placeholder="Ej: Lote Croquetas Julio"
                    value={batchName}
                    onChange={(event) => setBatchName(event.target.value)}
                    required
                  />

                  <Input
                    label="Cantidad"
                    type="number"
                    min={1}
                    max={5000}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                    required
                  />

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear lote
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle>Listado de lotes</CardTitle>

                <CardDescription>
                  Genera el hash del lote y exporta en PDF o CSV sin llenar la
                  tabla qr_codes.
                </CardDescription>
              </div>

              <div className="relative w-full lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar lote, producto o SKU..."
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-10 text-slate-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando lotes...
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center">
                <QrCode className="mx-auto h-10 w-10 text-slate-600" />

                <h3 className="mt-4 text-lg font-semibold text-white">
                  No hay lotes para mostrar
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Crea tu primer lote QR desde el botón Nuevo lote.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1060px] border-collapse">
                    <thead className="bg-slate-950">
                      <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-4 font-semibold">Lote</th>
                        <th className="px-4 py-4 font-semibold">Producto</th>
                        <th className="px-4 py-4 font-semibold">Cantidad</th>
                        <th className="px-4 py-4 font-semibold">Generados</th>
                        <th className="px-4 py-4 font-semibold">Estado</th>
                        <th className="px-4 py-4 font-semibold">Exportación</th>
                        <th className="px-4 py-4 font-semibold">Creado</th>
                        <th className="px-4 py-4 text-right font-semibold">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800 bg-slate-900/30">
                      {filteredBatches.map((batch) => {
                        const isGenerating = generatingBatchId === batch.id;
                        const isDownloadingPdf =
                          downloadingPdfBatchId === batch.id;
                        const isDownloadingCsv =
                          downloadingCsvBatchId === batch.id;
                        const isPrinting = printingBatchId === batch.id;
                        const canExport = canExportBatch(batch);

                        return (
                          <tr
                            key={batch.id}
                            className="transition hover:bg-slate-800/40"
                          >
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-semibold text-white">
                                  {batch.name}
                                </p>

                                <p className="mt-1 font-mono text-xs text-cyan-300">
                                  {batch.batch_code}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {batch.product?.name ?? "Sin producto"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  SKU: {batch.product?.sku ?? "N/A"}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-300">
                              {batch.quantity.toLocaleString("es-CO")}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-300">
                              {batch.generated_count.toLocaleString("es-CO")}
                            </td>

                            <td className="px-4 py-4">
                              <Badge variant={getStatusVariant(batch.status)}>
                                {getStatusLabel(batch.status)}
                              </Badge>
                            </td>

                            <td className="px-4 py-4">
                              {canExport ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium text-emerald-300">
                                    PDF / CSV listo
                                  </span>

                                  <span className="text-xs text-slate-500">
                                    Hash generado
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium text-amber-300">
                                    Pendiente
                                  </span>

                                  <span className="text-xs text-slate-500">
                                    Genera el lote primero
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-400">
                              {formatDate(batch.created_at)}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {batch.status === "draft" && (
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateBatch(batch.id)}
                                    disabled={isGenerating}
                                    title="Generar lote"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {isGenerating ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <PlayCircle className="h-5 w-5" />
                                    )}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(batch)}
                                  disabled={!canExport || isDownloadingPdf}
                                  title="Descargar PDF"
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {isDownloadingPdf ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Download className="h-5 w-5" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadCsv(batch)}
                                  disabled={!canExport || isDownloadingCsv}
                                  title="Descargar CSV"
                                  className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {isDownloadingCsv ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    "CSV"
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePrintBatch(batch)}
                                  disabled={!canExport || isPrinting}
                                  title="Imprimir"
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {isPrinting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Printer className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}