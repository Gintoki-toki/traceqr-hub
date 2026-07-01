import {
  Activity,
  Download,
  FileText,
  Printer,
  QrCode,
  Search,
  AlertTriangle,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Input from "../../components/ui/input/Input";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card/Card";

import { mockHistoryEvents } from "../../data/history";
import type { HistoryEventType } from "../../types/history";

function getEventLabel(type: HistoryEventType) {
  const labels: Record<HistoryEventType, string> = {
    batch_created: "Lote creado",
    qr_generated: "QR generados",
    pdf_downloaded: "PDF descargado",
    pdf_printed: "PDF impreso",
    batch_failed: "Error en lote",
  };

  return labels[type];
}

function getEventVariant(type: HistoryEventType) {
  const variants = {
    batch_created: "info",
    qr_generated: "success",
    pdf_downloaded: "info",
    pdf_printed: "success",
    batch_failed: "danger",
  } as const;

  return variants[type];
}

function getEventIcon(type: HistoryEventType) {
  const icons = {
    batch_created: FileText,
    qr_generated: QrCode,
    pdf_downloaded: Download,
    pdf_printed: Printer,
    batch_failed: AlertTriangle,
  };

  return icons[type];
}

export default function HistoryPage() {
  const generatedEvents = mockHistoryEvents.filter(
    (event) => event.type === "qr_generated"
  ).length;

  const pdfEvents = mockHistoryEvents.filter(
    (event) =>
      event.type === "pdf_downloaded" || event.type === "pdf_printed"
  ).length;

  const failedEvents = mockHistoryEvents.filter(
    (event) => event.type === "batch_failed"
  ).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Historial
            </h1>

            <p className="mt-2 text-slate-400">
              Consulta las acciones realizadas sobre lotes, códigos QR y PDFs.
            </p>
          </div>

          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Exportar historial
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Eventos totales</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {mockHistoryEvents.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Activity className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">Generaciones QR</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {generatedEvents}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">Eventos PDF</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {pdfEvents}
              </h2>

              {failedEvents > 0 && (
                <p className="mt-2 text-sm text-red-300">
                  {failedEvents} evento(s) con error
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle>Registro de actividad</CardTitle>

              <CardDescription>
                Trazabilidad de generación, descarga e impresión de lotes.
              </CardDescription>
            </div>

            <div className="w-full lg:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <Input placeholder="Buscar evento..." className="pl-10" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Evento</th>
                    <th className="px-4 py-3 font-medium">Lote</th>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Cantidad</th>
                    <th className="px-4 py-3 font-medium">Usuario</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Hora</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {mockHistoryEvents.map((event) => {
                    const Icon = getEventIcon(event.type);

                    return (
                      <tr
                        key={event.id}
                        className="text-slate-300 transition hover:bg-slate-950/60"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-slate-950 p-2 text-cyan-300">
                              <Icon className="h-5 w-5" />
                            </div>

                            <Badge variant={getEventVariant(event.type)}>
                              {getEventLabel(event.type)}
                            </Badge>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-medium text-white">
                          {event.batchCode}
                        </td>

                        <td className="px-4 py-4">{event.productName}</td>

                        <td className="px-4 py-4">
                          {event.quantity.toLocaleString("es-CO")}
                        </td>

                        <td className="px-4 py-4">{event.user}</td>

                        <td className="px-4 py-4">{event.date}</td>

                        <td className="px-4 py-4">{event.time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}