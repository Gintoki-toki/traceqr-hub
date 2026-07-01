import {
  LayoutDashboard,
  Package,
  Boxes,
  History,
  Users,
  Settings,
  QrCode,
} from "lucide-react";

export const PUBLIC_ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
} as const;

export const APP_ROUTES = {
  dashboard: "/dashboard",
  products: "/products",
  batches: "/batches",
  generate: "/generate",
  history: "/history",
  users: "/users",
  settings: "/settings",
} as const;

export const SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    path: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: "Productos",
    path: APP_ROUTES.products,
    icon: Package,
  },
  {
    label: "Lotes QR",
    path: APP_ROUTES.batches,
    icon: Boxes,
  },
  {
    label: "Generar QR",
    path: APP_ROUTES.generate,
    icon: QrCode,
  },
  {
    label: "Historial",
    path: APP_ROUTES.history,
    icon: History,
  },
  {
    label: "Usuarios",
    path: APP_ROUTES.users,
    icon: Users,
  },
  {
    label: "Configuración",
    path: APP_ROUTES.settings,
    icon: Settings,
  },
];