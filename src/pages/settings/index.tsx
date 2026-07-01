import {
  Building2,
  CheckCircle2,
  FileText,
  Printer,
  Save,
  ShieldCheck,
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

import { mockCompany, mockCompanySettings } from "../../data/company";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Configuración
            </h1>

            <p className="mt-2 text-slate-400">
              Administra la información de la empresa y las preferencias de generación.
            </p>
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Empresa</p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  {mockCompany.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {mockCompany.industry}
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Building2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">Estado</p>

              <div className="mt-3">
                <Badge variant="success">
                  Activa
                </Badge>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                Empresa habilitada para generar lotes QR.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Seguridad</p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  HMAC activo
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Generación criptográfica protegida.
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Información de la empresa</CardTitle>

              <CardDescription>
                Estos datos identificarán a la empresa dentro de TraceQrHub.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Nombre de la empresa"
                  defaultValue={mockCompany.name}
                />

                <Input
                  label="Correo empresarial"
                  defaultValue={mockCompany.email}
                />

                <Input
                  label="NIT / Tax ID"
                  defaultValue={mockCompany.taxId}
                />

                <Input
                  label="Industria"
                  defaultValue={mockCompany.industry}
                />

                <Input
                  label="País"
                  defaultValue={mockCompany.country}
                />

                <Input
                  label="Ciudad"
                  defaultValue={mockCompany.city}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias de PDF</CardTitle>

              <CardDescription>
                Configuración predeterminada para descarga e impresión.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Plantilla PDF predeterminada
                  </label>

                  <select
                    defaultValue={mockCompanySettings.defaultPdfTemplate}
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    <option>A4 estándar</option>
                    <option>A4 compacto</option>
                    <option>Etiquetas adhesivas</option>
                  </select>
                </div>

                <Input
                  label="Cantidad predeterminada de QR"
                  type="number"
                  defaultValue={mockCompanySettings.defaultQrQuantity}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="font-medium text-white">
                          Permitir descarga PDF
                        </p>

                        <p className="text-sm text-slate-400">
                          Los usuarios podrán descargar lotes en PDF.
                        </p>
                      </div>
                    </div>

                    <Badge variant="success">Activo</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <Printer className="h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="font-medium text-white">
                          Impresión directa
                        </p>

                        <p className="text-sm text-slate-400">
                          Habilita la opción de imprimir desde el navegador.
                        </p>
                      </div>
                    </div>

                    <Badge variant="success">Activo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Estado de configuración</CardTitle>

            <CardDescription>
              Resumen de capacidades habilitadas para la empresa.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                  <p className="font-medium text-white">
                    Empresa activa
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Puede crear productos, lotes y PDFs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                  <p className="font-medium text-white">
                    PDF habilitado
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Los lotes podrán descargarse para impresión.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                  <p className="font-medium text-white">
                    Seguridad activa
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Los QR se generarán mediante HMAC-SHA256 y SHA-512.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}