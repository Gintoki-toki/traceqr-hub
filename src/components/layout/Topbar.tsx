import { Bell, LogOut, Search, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PUBLIC_ROUTES } from "../../constants/routes";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";

export default function Topbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { company, member, isLoading } = useCompany();

  async function handleSignOut() {
    await signOut();
    navigate(PUBLIC_ROUTES.login);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur">
      <div>
        <h2 className="text-lg font-semibold text-white">TraceQrHub</h2>

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

        <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 md:flex">
          <UserCircle className="h-5 w-5" />

          <div className="max-w-56 truncate">
            <p className="truncate font-medium text-white">
              {isLoading ? "Cargando empresa..." : company?.name ?? "Empresa"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {member?.role ?? user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </header>
  );
}