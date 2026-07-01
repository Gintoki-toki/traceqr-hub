import {
  Boxes,
  Download,
  Eye,
  FileText,
  Plus,
  QrCode,
  Search,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card/Card";

import { mockBatches } from "../../data/batches";
import type { BatchStatus } from "../../types/batch";

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

export default function BatchesPage() {
  const totalQr = mockBatches.reduce(
    (total, batch) => total + batch.generatedCount,
    0
  );

  const readyPdfs = mockBatches.filter((batch) => batch.pdfReady).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Lotes QR
            </h1>

            <p className="mt-2 text-slate-400">
              Consulta los lotes generados y descarga los PDF listos para impresión.
            </p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo lote
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total lotes</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {mockBatches.length}
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
                <p className="text-sm text-slate-400">PDF listos</p>

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

        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle>Listado de lotes</CardTitle>

              <CardDescription>
                Lotes generados por la empresa y disponibles para descarga.
              </CardDescription>
            </div>

            <div className="w-full lg:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <Input
                  placeholder="Buscar lote..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
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
                  {mockBatches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="text-slate-300 transition hover:bg-slate-950/60"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-white">
                          {batch.batchCode}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {batch.name}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-white">
                          {batch.productName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {batch.productSku}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {batch.quantity.toLocaleString("es-CO")}
                      </td>

                      <td className="px-4 py-4">
                        {batch.generatedCount.toLocaleString("es-CO")}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={getStatusVariant(batch.status)}>
                          {getStatusLabel(batch.status)}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        {batch.pdfReady ? (
                          <Badge variant="info">Disponible</Badge>
                        ) : (
                          <Badge variant="default">Pendiente</Badge>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {batch.createdAt}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white">
                            <Eye className="h-5 w-5" />
                          </button>

                          <button
                            disabled={!batch.pdfReady}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}