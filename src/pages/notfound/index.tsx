import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import Button from "../../components/ui/button/Button";
import { APP_ROUTES, PUBLIC_ROUTES } from "../../constants/routes";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Error 404
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Página no encontrada
        </h1>

        <p className="mt-4 text-lg text-slate-400">
          La ruta que intentas visitar no existe o fue movida.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={PUBLIC_ROUTES.landing}>
            <Button variant="secondary" size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al inicio
            </Button>
          </Link>

          <Link to={APP_ROUTES.dashboard}>
            <Button size="lg">
              Ir al dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}