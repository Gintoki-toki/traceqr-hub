import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  Clock3,
  FileText,
  Layers,
  Loader2,
  Package,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card/Card";

import { useCompany } from "../../contexts/CompanyContext";
import type { BatchStatus, QRBatch } from "../../types/batch";
import type { Product } from "../../types/product";
import { getCompanyBatches } from "../../services/batches/batchService";
import { getCompanyProducts } from "../../services/products/productService";

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

export default function DashboardPage() {
  const { company } = useCompany();

  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<QRBatch[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(
      (product) => product.status === "active"
    ).length;

    const totalBatches = batches.length;
    const generatedBatches = batches.filter(
      (batch) => batch.status === "generated"
    ).length;

    const draftBatches = batches.filter(
      (batch) => batch.status === "draft"
    ).length;

    const exportableBatches = batches.filter(canExportBatch).length;

    const totalQrGenerated = batches.reduce(
      (total, batch) => total + batch.generated_count,
      0
    );

    const totalQrPlanned = batches.reduce(
      (total, batch) => total + batch.quantity,
      0
    );

    return {
      totalProducts,
      activeProducts,
      totalBatches,
      generatedBatches,
      draftBatches,
      exportableBatches,
      totalQrGenerated,
      totalQrPlanned,
    };
  }, [products, batches]);

  const recentBatches = useMemo(() => {
    return batches.slice(0, 5);
  }, [batches]);

  const recentProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  async function loadDashboardData() {
    if (!company?.id) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const [productData, batchData] = await Promise.all([
        getCompanyProducts(company.id),
        getCompanyBatches(company.id),
      ]);

      setProducts(productData);
      setBatches(batchData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la información del dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, [company?.id]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Resumen real de productos, lotes y códigos QR de{" "}
              {company?.name ?? "tu empresa"}.
            </p>
          </div>

          <Badge variant="info">Datos desde Supabase</Badge>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando dashboard...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Productos</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.totalProducts}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {stats.activeProducts} activos
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <Package className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Lotes QR</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.totalBatches}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {stats.generatedBatches} generados
                    </p>
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
                      {stats.totalQrGenerated.toLocaleString("es-CO")}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {stats.totalQrPlanned.toLocaleString("es-CO")} planeados
                    </p>
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
                      {stats.exportableBatches}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">PDF / CSV</p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <FileText className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de generación</CardTitle>

                  <CardDescription>
                    Vista general del flujo actual de generación de lotes.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                        <div>
                          <p className="text-sm text-slate-400">
                            Lotes generados
                          </p>

                          <p className="mt-1 text-2xl font-bold text-white">
                            {stats.generatedBatches}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                      <div className="flex items-center gap-3">
                        <Clock3 className="h-5 w-5 text-amber-300" />

                        <div>
                          <p className="text-sm text-slate-400">
                            Lotes borrador
                          </p>

                          <p className="mt-1 text-2xl font-bold text-white">
                            {stats.draftBatches}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-cyan-300" />

                        <div>
                          <p className="text-sm text-slate-400">
                            Registros en qr_codes
                          </p>

                          <p className="mt-1 text-2xl font-bold text-white">
                            0
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="font-medium text-cyan-100">
                          Lógica optimizada activa
                        </p>

                        <p className="mt-1 text-sm text-cyan-200/80">
                          TraceQrHub guarda solo lotes y hash maestro. Los QR
                          individuales se derivan en memoria al exportar PDF o
                          CSV, evitando llenar la base de datos con miles de
                          registros.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Empresa</CardTitle>

                  <CardDescription>
                    Información principal cargada desde Supabase.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm text-slate-400">Nombre</p>

                      <p className="mt-1 font-semibold text-white">
                        {company?.name ?? "Sin empresa"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm text-slate-400">Correo</p>

                      <p className="mt-1 font-semibold text-white">
                        {company?.email ?? "Sin correo"}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">NIT / ID fiscal</p>

                        <p className="mt-1 font-semibold text-white">
                          {company?.tax_id ?? "No registrado"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">Industria</p>

                        <p className="mt-1 font-semibold text-white">
                          {company?.industry ?? "No registrada"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Últimos lotes</CardTitle>

                  <CardDescription>
                    Lotes más recientes creados por la empresa.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {recentBatches.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
                      Aún no hay lotes registrados.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentBatches.map((batch) => (
                        <div
                          key={batch.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                            <div>
                              <p className="font-semibold text-white">
                                {batch.name}
                              </p>

                              <p className="mt-1 font-mono text-xs text-cyan-300">
                                {batch.batch_code}
                              </p>

                              <p className="mt-2 text-sm text-slate-400">
                                {batch.product?.name ?? "Sin producto"} ·{" "}
                                {batch.quantity.toLocaleString("es-CO")} QR
                              </p>
                            </div>

                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <Badge variant={getStatusVariant(batch.status)}>
                                {getStatusLabel(batch.status)}
                              </Badge>

                              <p className="text-xs text-slate-500">
                                {formatDate(batch.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Últimos productos</CardTitle>

                  <CardDescription>
                    Productos registrados recientemente para generar lotes.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {recentProducts.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
                      Aún no hay productos registrados.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentProducts.map((product) => (
                        <div
                          key={product.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                                <Layers className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-semibold text-white">
                                  {product.name}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                  SKU: {product.sku}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {product.category ?? "Sin categoría"}
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant={
                                product.status === "active"
                                  ? "success"
                                  : "default"
                              }
                            >
                              {product.status === "active"
                                ? "Activo"
                                : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}