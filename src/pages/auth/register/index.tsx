import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Factory,
  IdCard,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import AuthLayout from "../../../layouts/AuthLayout";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/ui/input/Input";
import { APP_ROUTES, PUBLIC_ROUTES } from "../../../constants/routes";
import { registerCompany } from "../../../services/auth/registerCompany";
import { supabase } from "../../../config/supabase";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!companyName || !companyEmail || !ownerName || !password) {
      setErrorMessage("Completa los campos obligatorios.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsLoading(true);

      await registerCompany({
        companyName,
        companyEmail,
        password,
        ownerName,
        taxId,
        industry,
      });

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: companyEmail,
        password,
      });

      if (loginError) {
        throw new Error(
          "La empresa fue creada, pero no se pudo iniciar sesión automáticamente."
        );
      }

      navigate(APP_ROUTES.dashboard);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la empresa."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Registrar empresa"
      description="Crea una cuenta empresarial para generar lotes de códigos QR."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="space-y-5">
            {errorMessage && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

              <Input
                label="Nombre de la empresa"
                placeholder="Ej: Empresa Demo S.A.S"
                className="pl-10"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

              <Input
                label="Correo empresarial"
                type="email"
                placeholder="contacto@empresa.com"
                className="pl-10"
                value={companyEmail}
                onChange={(event) => setCompanyEmail(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

                <Input
                  label="NIT / Tax ID"
                  placeholder="900123456-7"
                  className="pl-10"
                  value={taxId}
                  onChange={(event) => setTaxId(event.target.value)}
                />
              </div>

              <div className="relative">
                <Factory className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

                <Input
                  label="Industria"
                  placeholder="Alimentos, salud, retail..."
                  className="pl-10"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

              <Input
                label="Nombre del propietario"
                placeholder="Nombre completo"
                className="pl-10"
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

                <Input
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-200">
                Al registrarte se creará una empresa, un usuario propietario y
                un espacio empresarial para gestionar productos, lotes QR y PDFs.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Registrando empresa..." : "Registrar empresa"}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400">
          ¿Tu empresa ya tiene cuenta?{" "}
          <Link
            to={PUBLIC_ROUTES.login}
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}