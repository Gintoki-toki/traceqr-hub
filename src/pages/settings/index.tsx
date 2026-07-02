import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
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

import { supabase } from "../../config/supabase";
import { useCompany } from "../../contexts/CompanyContext";

export default function SettingsPage() {
  const { company, member, isLoading, errorMessage, refreshCompany } =
    useCompany();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState("");

  const [defaultPdfTemplate, setDefaultPdfTemplate] = useState("A4 estándar");
  const [defaultQrQuantity, setDefaultQrQuantity] = useState(500);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!company) return;

    setCompanyName(company.name ?? "");
    setCompanyEmail(company.email ?? "");
    setTaxId(company.tax_id ?? "");
    setIndustry(company.industry ?? "");
  }, [company]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company?.id) {
      setFormError("No se encontró la empresa actual.");
      return;
    }

    if (!companyName || !companyEmail) {
      setFormError("El nombre y el correo de la empresa son obligatorios.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      setSuccessMessage("");

      const { error } = await supabase
        .from("companies")
        .update({
          name: companyName.trim(),
          email: companyEmail.trim().toLowerCase(),
          tax_id: taxId.trim() || null,
          industry: industry.trim() || null,
        })
        .eq("id", company.id);

      if (error) {
        throw new Error(error.message);
      }

      await refreshCompany();

      setSuccessMessage("Configuración actualizada correctamente.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la configuración."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Configuración
            </h1>

            <p className="mt-2 text-slate-400">
              Administra la información real de la empresa y las preferencias de generación.
            </p>
          </div>

          <Button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </section>

        {(formError || errorMessage) && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {formError || errorMessage}
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
                <p className="text-sm text-slate-400">Empresa</p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  {isLoading ? "Cargando..." : company?.name ?? "Sin empresa"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {company?.industry ?? "Sin industria"}
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
                <Badge
                  variant={company?.status === "active" ? "success" : "default"}
                >
                  {company?.status === "active" ? "Activa" : "Inactiva"}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {company?.status === "active"
                  ? "Empresa habilitada para generar lotes QR."
                  : "Empresa sin acceso activo."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tu rol</p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  {member?.role ?? "Sin rol"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Permisos asociados al usuario actual.
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
                Estos datos vienen de la tabla real <strong>companies</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Nombre de la empresa"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  disabled={isLoading || isSaving}
                  required
                />

                <Input
                  label="Correo empresarial"
                  type="email"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                  disabled={isLoading || isSaving}
                  required
                />

                <Input
                  label="NIT / Tax ID"
                  value={taxId}
                  onChange={(event) => setTaxId(event.target.value)}
                  disabled={isLoading || isSaving}
                />

                <Input
                  label="Industria"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  disabled={isLoading || isSaving}
                />

                <Input
                  label="ID de empresa"
                  value={company?.id ?? ""}
                  disabled
                />

                <Input
                  label="Correo del miembro"
                  value={member?.email ?? ""}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias de PDF</CardTitle>

              <CardDescription>
                Por ahora estas preferencias son locales. Luego podemos guardarlas en una tabla propia.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Plantilla PDF predeterminada
                  </label>

                  <select
                    value={defaultPdfTemplate}
                    onChange={(event) =>
                      setDefaultPdfTemplate(event.target.value)
                    }
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
                  value={defaultQrQuantity}
                  onChange={(event) =>
                    setDefaultQrQuantity(Number(event.target.value))
                  }
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

                  <p className="font-medium text-white">Empresa activa</p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Puede crear productos, lotes y PDFs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                  <p className="font-medium text-white">PDF habilitado</p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Los lotes podrán descargarse para impresión.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                  <p className="font-medium text-white">Seguridad activa</p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Los QR se generarán mediante HMAC-SHA256 y SHA-512.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </DashboardLayout>
  );
}