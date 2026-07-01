import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "../constants/routes";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to={PUBLIC_ROUTES.landing} className="text-2xl font-bold">
            TraceQrHub
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to={PUBLIC_ROUTES.login}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Iniciar sesión
            </Link>

            <Link
              to={PUBLIC_ROUTES.register}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Registrar empresa
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}