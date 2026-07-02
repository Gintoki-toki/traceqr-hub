import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, LockKeyhole } from "lucide-react";

import AuthLayout from "../../../layouts/AuthLayout";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/ui/input/Input";
import { APP_ROUTES, PUBLIC_ROUTES } from "../../../constants/routes";
import { supabase } from "../../../config/supabase";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Ingresa correo y contraseña.");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      navigate(APP_ROUTES.dashboard);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      description="Accede al panel empresarial de TraceQrHub."
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
              <Mail className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-500" />

              <Input
                label="Correo"
                type="email"
                placeholder="empresa@correo.com"
                className="pl-10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                />
                Recordarme
              </label>

              <button
                type="button"
                className="font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                Olvidé mi contraseña
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400">
          ¿Tu empresa aún no tiene cuenta?{" "}
          <Link
            to={PUBLIC_ROUTES.register}
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Registrar empresa
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}