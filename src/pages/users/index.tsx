import {
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card/Card";

import { mockCompanyUsers } from "../../data/users";
import type {
  CompanyUserRole,
  CompanyUserStatus,
} from "../../types/user";

function getRoleLabel(role: CompanyUserRole) {
  const labels: Record<CompanyUserRole, string> = {
    owner: "Owner",
    admin: "Administrador",
    operator: "Operador",
  };

  return labels[role];
}

function getStatusLabel(status: CompanyUserStatus) {
  const labels: Record<CompanyUserStatus, string> = {
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
  };

  return labels[status];
}

function getStatusVariant(status: CompanyUserStatus) {
  const variants = {
    active: "success",
    inactive: "default",
    pending: "warning",
  } as const;

  return variants[status];
}

export default function UsersPage() {
  const activeUsers = mockCompanyUsers.filter(
    (user) => user.status === "active"
  ).length;

  const pendingUsers = mockCompanyUsers.filter(
    (user) => user.status === "pending"
  ).length;

  const adminUsers = mockCompanyUsers.filter(
    (user) => user.role === "admin" || user.role === "owner"
  ).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Usuarios
            </h1>

            <p className="mt-2 text-slate-400">
              Administra los miembros de la empresa que pueden acceder a TraceQrHub.
            </p>
          </div>

          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar usuario
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Usuarios totales</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {mockCompanyUsers.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">Usuarios activos</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {activeUsers}
              </h2>

              {pendingUsers > 0 && (
                <p className="mt-2 text-sm text-amber-300">
                  {pendingUsers} invitación pendiente
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Administradores</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {adminUsers}
                </h2>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle>Miembros de la empresa</CardTitle>

              <CardDescription>
                Usuarios autorizados para gestionar productos, lotes y PDFs.
              </CardDescription>
            </div>

            <div className="w-full lg:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <Input placeholder="Buscar usuario..." className="pl-10" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Usuario</th>
                    <th className="px-4 py-3 font-medium">Correo</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Último acceso</th>
                    <th className="px-4 py-3 font-medium">Creado</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {mockCompanyUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="text-slate-300 transition hover:bg-slate-950/60"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-300">
                            {user.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div>
                            <p className="font-medium text-white">
                              {user.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">{user.email}</td>

                      <td className="px-4 py-4">
                        {getRoleLabel(user.role)}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={getStatusVariant(user.status)}>
                          {getStatusLabel(user.status)}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">{user.lastAccess}</td>

                      <td className="px-4 py-4">{user.createdAt}</td>

                      <td className="px-4 py-4 text-right">
                        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}