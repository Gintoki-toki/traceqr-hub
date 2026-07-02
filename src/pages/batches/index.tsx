import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Download,
  Eye,
  FileText,
  Loader2,
  PlayCircle,
  Plus,
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
import { downloadBatchPdf } from "../../services/pdf/qrBatchPdfService";

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

function canDownloadBatchPdf(batch: QRBatch) {
  return batch.status === "generated" && Boolean(batch.batch_hash);
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
  const [downloadingBatchId, setDownloadingBatchId] = useState<string | null>(
    null
  );

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

  const readyPdfs = batches.filter(canDownloadBatchPdf).length;

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

    if (!batchName || quantity <= 0) {
      setErrorMessage("El nombre del lote y la cantidad son obligatorios.");
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
        "Lote generado correctamente. Los QR se derivarán desde el hash del lote al crear el PDF."
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
      setDownloadingBatchId(batch.id);
      setErrorMessage("");
      setSuccessMessage("");

      await downloadBatchPdf(batch);

      setSuccessMessage(
        "PDF generado correctamente. Los QR se derivaron en memoria sin guardar registros individuales."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo generar el PDF."
      );
    } finally {
      setDownloadingBatchId(null);
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
                <p className="text-sm text-slate-400">PDF generables</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {readyPdfs}
                </h2>
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
                  Primero debes crear un producto antes de generar lotes QR.
                </div>
              ) : (
                <form
                  onSubmit={handleCreateBatch}
                  className="grid gap-5 md:grid-cols-2"
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
                    label="Cantidad de QR"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                    required
                  />

                  <div className="flex items-end">
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creando lote..." : "Crear lote"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle>Listado de lotes</CardTitle>

              <CardDescription>
                Lotes guardados en la tabla real <strong>qr_batches</strong>.
              </CardDescription>
            </div>

            <div className="w-full lg:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <Input
                  placeholder="Buscar lote..."
                  className="pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
                Cargando lotes...
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
                <p className="font-medium text-white">No hay lotes todavía</p>

                <p className="mt-2 text-sm text-slate-400">
                  Crea tu primer lote para luego generar QR y PDF.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Lote</th>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium">Cantidad</th>
                      <th className="px-4 py-3 font-medium">Generados</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">PDF</th>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredBatches.map((batch) => (
                      <tr
                        key={batch.id}
                        className="text-slate-300 transition hover:bg-slate-950/60"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium text-white">
                            {batch.batch_code}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {batch.name}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-white">
                            {batch.product?.name ?? "Sin producto"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {batch.product?.sku ?? "Sin SKU"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          {batch.quantity.toLocaleString("es-CO")}
                        </td>

                        <td className="px-4 py-4">
                          {batch.generated_count.toLocaleString("es-CO")}
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={getStatusVariant(batch.status)}>
                            {getStatusLabel(batch.status)}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          {canDownloadBatchPdf(batch) ? (
                            <Badge variant="info">Generable</Badge>
                          ) : (
                            <Badge variant="default">Pendiente</Badge>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {new Date(batch.created_at).toLocaleDateString(
                            "es-CO"
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {batch.status === "draft" ? (
                              <button
                                type="button"
                                onClick={() => handleGenerateBatch(batch.id)}
                                disabled={generatingBatchId === batch.id}
                                title="Generar lote"
                                className="rounded-lg p-2 text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {generatingBatchId === batch.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <PlayCircle className="h-5 w-5" />
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Ver lote"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(batch)}
                              disabled={
                                !canDownloadBatchPdf(batch) ||
                                downloadingBatchId === batch.id
                              }
                              title="Descargar PDF"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {downloadingBatchId === batch.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Download className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}