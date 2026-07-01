import { Bell, Search, UserCircle } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur">
      <div>
        <h2 className="text-lg font-semibold text-white">
          TraceQrHub
        </h2>

        <p className="text-xs text-slate-400">
          Portal empresarial para generación de lotes QR
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-700 hover:text-white md:flex">
          <Search className="h-4 w-4" />
          Buscar
        </button>

        <button className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-400 transition hover:border-slate-700 hover:text-white">
          <Bell className="h-5 w-5" />
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white">
          <UserCircle className="h-5 w-5" />
          Empresa demo
        </button>
      </div>
    </header>
  );
}