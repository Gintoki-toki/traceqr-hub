import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Hash,
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
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
import type { QRBatch } from "../../types/batch";
import type { QREvent } from "../../types/qrEvent";
import { getCompanyBatches } from "../../services/batches/batchService";
import { getCompanyQrEvents } from "../../services/history/qrEventService";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getEventLabel(eventType: string) {
  const labels: Record<string, string> = {
    qr_generated: "Lote generado",
    batch_generated: "Lote generado",
    pdf_downloaded: "PDF descargado",
    csv_downloaded: "CSV descargado",
    print_prepared: "Impresión preparada",
  };

  return labels[eventType] ?? eventType;
}

function getEventDescription(event: QREvent) {
  if (event.event_type === "qr_generated") {
    return "Se generó el hash maestro del lote. Los QR individuales se derivan en memoria.";
  }

  if (event.event_type === "pdf_downloaded") {
    return "Se descargó un archivo PDF con los códigos QR del lote.";
  }

  if (event.event_type === "csv_downloaded") {
    return "Se descargó un archivo CSV con short_code, token y qr_url.";
  }

  return "Evento registrado en el sistema.";
}

function getEventIcon(eventType: string) {
  if (eventType === "qr_generated" || eventType === "batch_generated") {
    return QrCode;
  }

  if (eventType === "pdf_downloaded" || eventType === "csv_downloaded") {
    return FileText;
  }

  return Activity;
}

function getEventVariant(eventType: string) {
  if (eventType === "qr_generated" || eventType === "batch_generated") {
    return "success";
  }

  if (eventType === "pdf_downloaded" || eventType === "csv_downloaded") {
    return "info";
  }

  return "default";
}

function getBatchForEvent(event: QREvent, batches: QRBatch[]) {
  if (!event.batch_id) return null;

  return batches.find((batch) => batch.id === event.batch_id) ?? null;
}

function getQuantityFromEvent(event: QREvent, batch: QRBatch | null) {
  if (typeof event.metadata?.quantity === "number") {
    return event.metadata.quantity;
  }

  return batch?.quantity ?? 0;
}

function getBatchCodeFromEvent(event: QREvent, batch: QRBatch | null) {
  if (typeof event.metadata?.batchCode === "string") {
    return event.metadata.batchCode;
  }

  return batch?.batch_code ?? "Sin lote";
}

export default function HistoryPage() {
  const { company } = useCompany();

  const [events, setEvents] = useState<QREvent[]>([]);
  const [batches, setBatches] = useState<QRBatch[]>([]);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredEvents = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return events;

    return events.filter((event) => {
      const batch = getBatchForEvent(event, batches);
      const batchCode = getBatchCodeFromEvent(event, batch);
      const label = getEventLabel(event.event_type);

      return (
        label.toLowerCase().includes(value) ||
        event.event_type.toLowerCase().includes(value) ||
        batchCode.toLowerCase().includes(value) ||
        batch?.name.toLowerCase().includes(value) ||
        batch?.product?.name.toLowerCase().includes(value) ||
        batch?.product?.sku.toLowerCase().includes(value)
      );
    });
  }, [events, batches, search]);

  const stats = useMemo(() => {
    const generatedEvents = events.filter(
      (event) =>
        event.event_type === "qr_generated" ||
        event.event_type === "batch_generated"
    ).length;

    const totalQrFromEvents = events.reduce((total, event) => {
      const batch = getBatchForEvent(event, batches);

      if (
        event.event_type === "qr_generated" ||
        event.event_type === "batch_generated"
      ) {
        return total + getQuantityFromEvent(event, batch);
      }

      return total;
    }, 0);

    return {
      totalEvents: events.length,
      generatedEvents,
      totalQrFromEvents,
      latestEvent: events[0] ?? null,
    };
  }, [events, batches]);

  async function loadHistory() {
    if (!company?.id) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const [eventData, batchData] = await Promise.all([
        getCompanyQrEvents(company.id),
        getCompanyBatches(company.id),
      ]);

      setEvents(eventData);
      setBatches(batchData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [company?.id]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Historial
            </h1>

            <p className="mt-2 text-slate-400">
              Eventos reales registrados para {company?.name ?? "tu empresa"}.
            </p>
          </div>

          <Badge variant="info">Tabla qr_events</Badge>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando historial...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Eventos</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.totalEvents}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Registros en qr_events
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <Activity className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Lotes generados</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.generatedEvents}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Eventos de generación
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <Hash className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">QR registrados</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.totalQrFromEvents.toLocaleString("es-CO")}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Sumados desde eventos
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <QrCode className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
              <Card>
                <CardHeader>
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                      <CardTitle>Registro de eventos</CardTitle>

                      <CardDescription>
                        Historial ordenado desde el evento más reciente.
                      </CardDescription>
                    </div>

                    <div className="relative w-full lg:max-w-xs">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar evento, lote o producto..."
                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {filteredEvents.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center">
                      <Clock3 className="mx-auto h-10 w-10 text-slate-600" />

                      <h3 className="mt-4 text-lg font-semibold text-white">
                        No hay eventos para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        Cuando generes lotes, aparecerán aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event) => {
                        const batch = getBatchForEvent(event, batches);
                        const EventIcon = getEventIcon(event.event_type);
                        const quantity = getQuantityFromEvent(event, batch);
                        const batchCode = getBatchCodeFromEvent(event, batch);

                        return (
                          <article
                            key={event.id}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex gap-4">
                                <div className="h-fit rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                                  <EventIcon className="h-5 w-5" />
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-white">
                                      {getEventLabel(event.event_type)}
                                    </h3>

                                    <Badge
                                      variant={getEventVariant(event.event_type)}
                                    >
                                      {event.event_type}
                                    </Badge>
                                  </div>

                                  <p className="mt-2 text-sm text-slate-400">
                                    {getEventDescription(event)}
                                  </p>

                                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                                      <p className="text-xs text-slate-500">
                                        Lote
                                      </p>

                                      <p className="mt-1 font-mono text-xs text-cyan-300">
                                        {batchCode}
                                      </p>

                                      <p className="mt-1 text-sm text-white">
                                        {batch?.name ?? "Sin nombre de lote"}
                                      </p>
                                    </div>

                                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                                      <p className="text-xs text-slate-500">
                                        Producto
                                      </p>

                                      <p className="mt-1 text-sm font-semibold text-white">
                                        {batch?.product?.name ?? "Sin producto"}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        SKU: {batch?.product?.sku ?? "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 lg:items-end">
                                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                                  <p className="text-xs text-slate-500">
                                    Cantidad
                                  </p>

                                  <p className="mt-1 text-xl font-bold text-white">
                                    {quantity.toLocaleString("es-CO")}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                  <CalendarClock className="h-4 w-4" />
                                  {formatDate(event.created_at)}
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen técnico</CardTitle>

                    <CardDescription>
                      Cómo se están registrando los eventos.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />

                          <div>
                            <p className="font-medium text-white">
                              Hash maestro por lote
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              Cada evento de generación indica que el lote ya
                              tiene un batch_hash listo para derivar QR.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-start gap-3">
                          <Database className="mt-0.5 h-5 w-5 text-cyan-300" />

                          <div>
                            <p className="font-medium text-white">
                              Sin llenar qr_codes
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              El historial se guarda en qr_events, pero los QR
                              individuales no se insertan en qr_codes.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">
                          Último evento
                        </p>

                        <p className="mt-1 font-semibold text-white">
                          {stats.latestEvent
                            ? getEventLabel(stats.latestEvent.event_type)
                            : "Sin eventos"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {stats.latestEvent
                            ? formatDate(stats.latestEvent.created_at)
                            : "Aún no hay registros"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Eventos actuales</CardTitle>

                    <CardDescription>
                      Por ahora se registra la generación del lote.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <p className="font-medium text-emerald-100">
                          qr_generated
                        </p>

                        <p className="mt-1 text-sm text-emerald-200/80">
                          Se crea cuando el lote pasa de borrador a generado.
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                        <p className="font-medium text-amber-100">
                          Próximos eventos
                        </p>

                        <p className="mt-1 text-sm text-amber-200/80">
                          Después podemos registrar descargas PDF, CSV e
                          impresión preparada.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}