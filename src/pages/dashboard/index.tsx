import {
  Boxes,
  Package,
  QrCode,
  ScanLine,
  ArrowUpRight,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card/Card";

const stats = [
  {
    label: "Productos",
    value: "12",
    description: "Productos activos",
    icon: Package,
  },
  {
    label: "Lotes QR",
    value: "34",
    description: "Lotes generados",
    icon: Boxes,
  },
  {
    label: "QR generados",
    value: "18.450",
    description: "Códigos únicos",
    icon: QrCode,
  },
  {
    label: "Escaneos",
    value: "6.921",
    description: "Validaciones registradas",
    icon: ScanLine,
  },
];

const recentBatches = [
  {
    id: "L-001",
    product: "Café Premium 500g",
    quantity: 1500,
    status: "Generado",
    date: "01 Jul 2026",
  },
  {
    id: "L-002",
    product: "Panela Orgánica",
    quantity: 800,
    status: "Generado",
    date: "30 Jun 2026",
  },
  {
    id: "L-003",
    product: "Miel Natural",
    quantity: 1200,
    status: "Pendiente",
    date: "29 Jun 2026",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Bienvenido a TraceQrHub
            </h1>

            <p className="mt-2 text-slate-400">
              Panel inicial del sistema de generación de lotes QR.
            </p>
          </div>

          <Button>Crear nuevo lote</Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label}>
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{item.label}</p>

                    <h2 className="mt-3 text-3xl font-bold text-white">
                      {item.value}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <Icon className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Últimos lotes</CardTitle>

              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Lote</th>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium">Cantidad</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {recentBatches.map((batch) => (
                      <tr key={batch.id} className="text-slate-300">
                        <td className="px-4 py-4 font-medium text-white">
                          {batch.id}
                        </td>

                        <td className="px-4 py-4">{batch.product}</td>

                        <td className="px-4 py-4">{batch.quantity}</td>

                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              batch.status === "Generado"
                                ? "success"
                                : "warning"
                            }
                          >
                            {batch.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">{batch.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flujo de trabajo</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium text-white">1. Crear producto</p>

                  <p className="mt-1 text-sm text-slate-400">
                    Registra el producto que será asociado al lote.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium text-white">
                    2. Generar lote QR
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Define cantidad, lote y parámetros de impresión.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium text-white">3. Descargar PDF</p>

                  <p className="mt-1 text-sm text-slate-400">
                    Exporta los QR en formato listo para imprimir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}