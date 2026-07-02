import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
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
import type { Product } from "../../types/product";
import type { QRBatch } from "../../types/batch";
import { getCompanyProducts } from "../../services/products/productService";
import {
  createBatch,
  generateBatchHash,
  getCompanyBatches,
} from "../../services/batches/batchService";
import {
  downloadBatchPdf,
  printBatchPdf,
} from "../../services/pdf/qrBatchPdfService";
import { downloadBatchCsv } from "../../services/pdf/qrBatchCsvService";
import { registerBatchExportEvent } from "../../services/history/createQrEventService";

function estimatePdfPages(quantity: number) {
  const qrPerPage = 20;

  return Math.ceil(quantity / qrPerPage);
}

export default function GeneratePage() {
  const { user } = useAuth();
  const { company } = useCompany();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [batchName, setBatchName] = useState("Lote de producción inicial");
  const [quantity, setQuantity] = useState(100);

  const [generatedBatch, setGeneratedBatch] = useState<QRBatch | null>(null);

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const pages = estimatePdfPages(quantity);

  async function loadProducts() {
    if (!company?.id) return;

    try {
      setIsLoadingProducts(true);
      setErrorMessage("");

      const data = await getCompanyProducts(company.id);

      setProducts(data);

      if (data.length > 0) {
        setSelectedProductId(data[0].id);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los productos."
      );
    } finally {
      setIsLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [company?.id]);

  async function handleGenerateBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company?.id || !user?.id) {
      setErrorMessage("No se encontró la empresa o el usuario actual.");
      return;
    }

    if (!selectedProductId) {
      setErrorMessage("Selecciona un producto.");
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
      setIsGenerating(true);
      setErrorMessage("");
      setSuccessMessage("");
      setGeneratedBatch(null);

      const newBatch = await createBatch({
        companyId: company.id,
        userId: user.id,
        productId: selectedProductId,
        name: batchName,
        quantity,
      });

      await generateBatchHash(newBatch.id);

      const updatedBatches = await getCompanyBatches(company.id);
      const updatedBatch =
        updatedBatches.find((batch) => batch.id === newBatch.id) ?? null;

      if (!updatedBatch?.batch_hash) {
        throw new Error("El lote fue creado, pero no se encontró el hash.");
      }

      setGeneratedBatch(updatedBatch);

      setSuccessMessage(
        "Lote generado correctamente. Ya puedes descargar el PDF o CSV."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo generar el lote QR."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!generatedBatch) {
      setErrorMessage("Primero debes generar un lote.");
      return;
    }

    try {
      setIsDownloadingPdf(true);
      setErrorMessage("");
      setSuccessMessage("");

      await downloadBatchPdf(generatedBatch);

      await registerBatchExportEvent({
        batch: generatedBatch,
        eventType: "pdf_downloaded",
      });

      setSuccessMessage("PDF generado correctamente y registrado en el historial.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo descargar el PDF."
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function handleDownloadCsv() {
    if (!generatedBatch) {
      setErrorMessage("Primero debes generar un lote.");
      return;
    }

    try {
      setIsDownloadingCsv(true);
      setErrorMessage("");
      setSuccessMessage("");

      await downloadBatchCsv(generatedBatch);

      await registerBatchExportEvent({
        batch: generatedBatch,
        eventType: "csv_downloaded",
      });

      setSuccessMessage("CSV generado correctamente y registrado en el historial.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo descargar el CSV."
      );
    } finally {
      setIsDownloadingCsv(false);
    }
  }

  async function handlePreparePrint() {
    if (!generatedBatch) {
      setErrorMessage("Primero debes generar un lote.");
      return;
    }

    try {
      setIsPreparingPrint(true);
      setErrorMessage("");
      setSuccessMessage("");

      await printBatchPdf(generatedBatch);

      await registerBatchExportEvent({
        batch: generatedBatch,
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
      setIsPreparingPrint(false);
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
              Crea un lote, genera su hash maestro y exporta los QR en PDF o CSV.
            </p>
          </div>

          <Badge variant="info">HMAC-SHA256 + SHA-512</Badge>
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
              <CardTitle>Nuevo lote QR</CardTitle>

              <CardDescription>
                Este flujo crea el lote real en Supabase y genera solo el hash
                del lote. Los QR individuales se derivan en memoria al exportar.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isLoadingProducts ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
                  Cargando productos...
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
                  Primero debes crear un producto en la sección Productos.
                </div>
              ) : (
                <form onSubmit={handleGenerateBatch} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Producto
                    </label>

                    <select
                      value={selectedProductId}
                      onChange={(event) =>
                        setSelectedProductId(event.target.value)
                      }
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
                    label="Cantidad de códigos QR"
                    type="number"
                    min={1}
                    max={5000}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                    required
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Formatos de salida
                    </label>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <FileText className="h-5 w-5 text-cyan-300" />

                        <p className="mt-3 font-medium text-white">
                          PDF para impresión
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          A4 estándar, 20 QR por página.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <FileText className="h-5 w-5 text-cyan-300" />

                        <p className="mt-3 font-medium text-white">
                          CSV para máquina
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Incluye short_code, token y qr_url.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="font-medium text-cyan-100">
                          Generación segura sin sobrecargar la base
                        </p>

                        <p className="mt-1 text-sm text-cyan-200/80">
                          Se guardará solo el hash maestro del lote. Los QR se
                          calculan al momento de crear el PDF o CSV.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creando y generando lote...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Crear lote y generar hash
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista previa</CardTitle>

                <CardDescription>
                  Resumen del lote antes de exportar.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="text-sm text-slate-400">Producto</p>

                        <p className="font-semibold text-white">
                          {selectedProduct?.name ?? "Sin producto seleccionado"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {selectedProduct?.sku ?? "Sin SKU"}
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
                          {batchName || "Sin nombre"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <QrCode className="h-5 w-5 text-cyan-300" />

                      <p className="mt-3 text-sm text-slate-400">
                        QR a generar
                      </p>

                      <p className="mt-1 text-3xl font-bold text-white">
                        {quantity.toLocaleString("es-CO")}
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>

                <CardDescription>
                  Cuando el lote esté generado podrás descargar PDF, CSV o abrir
                  la impresión.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!generatedBatch ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-400">
                    Aún no has generado un lote en esta pantalla.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />

                        <div>
                          <p className="font-medium text-emerald-100">
                            Lote generado correctamente
                          </p>

                          <p className="mt-1 text-sm text-emerald-200/80">
                            {generatedBatch.batch_code} —{" "}
                            {generatedBatch.generated_count.toLocaleString(
                              "es-CO"
                            )}{" "}
                            QR derivados desde batch_hash.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm text-slate-400">Hash del lote</p>

                      <p className="mt-2 break-all font-mono text-xs text-cyan-200">
                        {generatedBatch.batch_hash}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
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
                            PDF
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleDownloadCsv}
                        disabled={isDownloadingCsv}
                      >
                        {isDownloadingCsv ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            CSV...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            CSV
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!generatedBatch || isPreparingPrint}
                        onClick={handlePreparePrint}
                      >
                        {isPreparingPrint ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Imprimiendo...
                          </>
                        ) : (
                          <>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
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