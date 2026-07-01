import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  FileText,
  Layers,
  QrCode,
  ShieldCheck,
} from "lucide-react";

import PublicLayout from "../../layouts/PublicLayout";
import Button from "../../components/ui/button/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card/Card";
import { PUBLIC_ROUTES } from "../../constants/routes";

const features = [
  {
    title: "Registro de empresas",
    description:
      "Cada empresa gestiona sus propios productos, lotes y códigos QR.",
    icon: Building2,
  },
  {
    title: "Generación por lotes",
    description:
      "Crea cientos o miles de códigos QR únicos asociados a un producto.",
    icon: Layers,
  },
  {
    title: "Seguridad criptográfica",
    description:
      "Lotes protegidos con HMAC-SHA256 y códigos individuales derivados con SHA-512.",
    icon: ShieldCheck,
  },
  {
    title: "Exportación en PDF",
    description:
      "Descarga o imprime los códigos QR en formatos listos para producción.",
    icon: FileText,
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_35%)]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              Plataforma empresarial de generación QR
            </div>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-6xl">
              Crea lotes de códigos QR seguros para tus productos.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              TraceQrHub permite a empresas registrar productos, generar lotes
              de códigos QR únicos y exportarlos en PDF para descarga o
              impresión.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={PUBLIC_ROUTES.register}>
                <Button size="lg">
                  Registrar empresa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to={PUBLIC_ROUTES.login}>
                <Button variant="secondary" size="lg">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-500/10">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Lote QR</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">
                    LOT-2026-001
                  </h3>
                </div>

                <div className="rounded-2xl bg-cyan-400/10 p-4 text-cyan-300">
                  <QrCode className="h-8 w-8" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">QR generados</p>
                  <p className="mt-2 text-3xl font-bold text-white">1.500</p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-sm text-slate-400">PDF</p>
                  <p className="mt-2 text-3xl font-bold text-white">125 pág.</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-sm text-cyan-200">
                  Generación protegida mediante HMAC-SHA256 y SHA-512.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white">
              Diseñado para empresas que necesitan trazabilidad.
            </h2>

            <p className="mt-3 text-slate-400">
              Una herramienta especializada para crear, organizar y exportar
              lotes QR vinculados a productos reales.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    <CardTitle>{feature.title}</CardTitle>

                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h2 className="text-3xl font-bold text-white">
            Comienza a generar lotes QR para tu empresa.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Registra tu empresa, crea tus productos y descarga tus códigos en
            PDF listos para impresión.
          </p>

          <div className="mt-8">
            <Link to={PUBLIC_ROUTES.register}>
              <Button size="lg">Crear cuenta empresarial</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}