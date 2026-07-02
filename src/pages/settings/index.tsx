import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
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

function canEditCompanySettings(role?: string | null) {
  return role === "owner" || role === "admin";
}

function getRoleLabel(role?: string | null) {
  if (role === "owner") return "Propietario";
  if (role === "admin") return "Administrador";
  if (role === "operator") return "Operador";

  return "Sin rol";
}

export default function SettingsPage() {
  const { company, member, refreshCompany } = useCompany();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const userCanEdit = canEditCompanySettings(member?.role);

  useEffect(() => {
    if (!company) return;

    setCompanyName(company.name ?? "");
    setCompanyEmail(company.email ?? "");
    setTaxId(company.tax_id ?? "");
    setIndustry(company.industry ?? "");
  }, [company]);

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company?.id) {
      setErrorMessage("No se encontró la empresa actual.");
      return;
    }

    if (!userCanEdit) {
      setErrorMessage(
        "No tienes permisos para editar la configuración de la empresa."
      );
      return;
    }

    if (!companyName.trim()) {
      setErrorMessage("El nombre de la empresa es obligatorio.");
      return;
    }

    if (!companyEmail.trim()) {
      setErrorMessage("El correo de la empresa es obligatorio.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const { error } = await supabase
        .from("companies")
        .update({
          name: companyName.trim(),
          email: companyEmail.trim().toLowerCase(),
          tax_id: taxId.trim() || null,
          industry: industry.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", company.id);

      if (error) {
        throw new Error(error.message);
      }

      await refreshCompany();

      setSuccessMessage("Configuración actualizada correctamente.");
    } catch (error) {
      setErrorMessage(
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
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Configuración
            </h1>

            <p className="mt-2 text-slate-400">
              Información principal y permisos de configuración de{" "}
              {company?.name ?? "tu empresa"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="info">Empresa</Badge>

            <Badge variant={userCanEdit ? "success" : "default"}>
              {getRoleLabel(member?.role)}
            </Badge>
          </div>
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

        {!userCanEdit && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 text-amber-300" />

              <div>
                <p className="font-medium text-amber-100">
                  Permisos limitados
                </p>

                <p className="mt-1 text-sm text-amber-200/80">
                  Puedes ver la configuración de la empresa, pero solo un
                  propietario o administrador puede modificar estos datos.
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la empresa</CardTitle>

              <CardDescription>
                Información cargada desde la tabla real{" "}
                <strong>companies</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-5">
                <Input
                  label="Nombre de la empresa"
                  placeholder="Ej: DokyVet Colombia"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  disabled={!userCanEdit || isSaving}
                  required
                />

                <Input
                  label="Correo de la empresa"
                  type="email"
                  placeholder="empresa@correo.com"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                  disabled={!userCanEdit || isSaving}
                  required
                />

                <Input
                  label="NIT / ID fiscal"
                  placeholder="Ej: 900123456-7"
                  value={taxId}
                  onChange={(event) => setTaxId(event.target.value)}
                  disabled={!userCanEdit || isSaving}
                />

                <Input
                  label="Industria"
                  placeholder="Ej: Veterinaria"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  disabled={!userCanEdit || isSaving}
                />

                {userCanEdit ? (
                  <Button type="submit" disabled={isSaving}>
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
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                    Los campos están bloqueados porque tu rol actual no permite
                    editar la configuración.
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>

                <CardDescription>
                  Estado actual de la empresa y del usuario.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="text-sm text-slate-400">Empresa</p>

                        <p className="mt-1 font-semibold text-white">
                          {company?.name ?? "Sin empresa"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="text-sm text-slate-400">Correo</p>

                        <p className="mt-1 font-semibold text-white">
                          {company?.email ?? "Sin correo"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-start gap-3">
                      <KeyRound className="mt-0.5 h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="text-sm text-slate-400">Tu rol</p>

                        <p className="mt-1 font-semibold text-white">
                          {getRoleLabel(member?.role)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permisos</CardTitle>

                <CardDescription>
                  Control visual de acceso según rol.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {userCanEdit ? (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />

                        <div>
                          <p className="font-medium text-emerald-100">
                            Edición permitida
                          </p>

                          <p className="mt-1 text-sm text-emerald-200/80">
                            Tu rol permite modificar la información principal
                            de la empresa.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="mt-0.5 h-5 w-5 text-amber-300" />

                        <div>
                          <p className="font-medium text-amber-100">
                            Solo lectura
                          </p>

                          <p className="mt-1 text-sm text-amber-200/80">
                            Tu rol actual solo permite consultar esta
                            información.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="font-medium text-cyan-100">
                          Seguridad por RLS
                        </p>

                        <p className="mt-1 text-sm text-cyan-200/80">
                          Aunque la interfaz bloquee o permita acciones, la base
                          de datos también valida permisos con Row Level
                          Security.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}