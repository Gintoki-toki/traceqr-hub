import { NavLink } from "react-router-dom";
import { SIDEBAR_ITEMS } from "../../constants/routes";

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-800 bg-slate-950 px-4 py-6 lg:block">
      <div className="px-3">
        <h1 className="text-xl font-bold tracking-tight text-white">
          TraceQrHub
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Generación empresarial de QR
        </p>
      </div>

      <nav className="mt-8 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-sm font-medium text-white">
          Estado del sistema
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="text-sm text-slate-400">
            Operativo
          </span>
        </div>
      </div>
    </aside>
  );
}