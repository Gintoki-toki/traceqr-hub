import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "../constants/routes";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        <section className="hidden border-r border-slate-800 bg-slate-900/40 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to={PUBLIC_ROUTES.landing} className="text-2xl font-bold">
              TraceQrHub
            </Link>

            <p className="mt-2 max-w-md text-slate-400">
              Plataforma empresarial para crear lotes de códigos QR seguros y
              exportarlos en PDF para impresión.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
            <p className="text-sm font-medium text-cyan-300">
              Generación segura
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              HMAC-SHA256 + SHA-512
            </h2>

            <p className="mt-4 text-slate-400">
              Cada lote se genera con un hash maestro y cada QR individual se
              deriva criptográficamente para evitar falsificaciones.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link
                to={PUBLIC_ROUTES.landing}
                className="mb-8 inline-block text-2xl font-bold lg:hidden"
              >
                TraceQrHub
              </Link>

              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

              <p className="mt-2 text-slate-400">{description}</p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </div>
  );
}