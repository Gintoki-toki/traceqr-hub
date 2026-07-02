import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card/Card";

import { useCompany } from "../../contexts/CompanyContext";
import type { CompanyMemberProfile } from "../../types/companyProfile";
import { getCompanyMembers } from "../../services/users/companyMemberService";

function getRoleLabel(role: CompanyMemberProfile["role"]) {
  const labels: Record<CompanyMemberProfile["role"], string> = {
    owner: "Propietario",
    admin: "Administrador",
    operator: "Operador",
  };

  return labels[role];
}

function getRoleVariant(role: CompanyMemberProfile["role"]) {
  const variants = {
    owner: "info",
    admin: "success",
    operator: "default",
  } as const;

  return variants[role];
}

function getStatusLabel(status: CompanyMemberProfile["status"]) {
  const labels: Record<CompanyMemberProfile["status"], string> = {
    active: "Activo",
    inactive: "Inactivo",
  };

  return labels[status];
}

function getStatusVariant(status: CompanyMemberProfile["status"]) {
  const variants = {
    active: "success",
    inactive: "default",
  } as const;

  return variants[status];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export default function UsersPage() {
  const { company, member } = useCompany();

  const [members, setMembers] = useState<CompanyMemberProfile[]>([]);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredMembers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return members;

    return members.filter((companyMember) => {
      return (
        companyMember.display_name.toLowerCase().includes(value) ||
        companyMember.email.toLowerCase().includes(value) ||
        companyMember.role.toLowerCase().includes(value) ||
        companyMember.status.toLowerCase().includes(value)
      );
    });
  }, [members, search]);

  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(
      (companyMember) => companyMember.status === "active"
    ).length;

    const inactiveMembers = members.filter(
      (companyMember) => companyMember.status === "inactive"
    ).length;

    const owners = members.filter(
      (companyMember) => companyMember.role === "owner"
    ).length;

    const admins = members.filter(
      (companyMember) => companyMember.role === "admin"
    ).length;

    const operators = members.filter(
      (companyMember) => companyMember.role === "operator"
    ).length;

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      owners,
      admins,
      operators,
    };
  }, [members]);

  async function loadMembers() {
    if (!company?.id) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getCompanyMembers(company.id);

      setMembers(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los usuarios."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [company?.id]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Usuarios
            </h1>

            <p className="mt-2 text-slate-400">
              Miembros reales asociados a {company?.name ?? "tu empresa"}.
            </p>
          </div>

          <Badge variant="info">Tabla company_members</Badge>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cargando usuarios...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Miembros</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.totalMembers}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Registrados en la empresa
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <Users className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Activos</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.activeMembers}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Pueden operar el sistema
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Inactivos</p>

                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {stats.inactiveMembers}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Sin acceso operativo
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <UserX className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
              <Card>
                <CardHeader>
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                      <CardTitle>Listado de usuarios</CardTitle>

                      <CardDescription>
                        Usuarios asociados a la empresa desde company_members.
                      </CardDescription>
                    </div>

                    <div className="relative w-full lg:max-w-xs">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar usuario, correo o rol..."
                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {filteredMembers.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center">
                      <Users className="mx-auto h-10 w-10 text-slate-600" />

                      <h3 className="mt-4 text-lg font-semibold text-white">
                        No hay usuarios para mostrar
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        Cuando existan miembros asociados aparecerán aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] border-collapse">
                          <thead className="bg-slate-950">
                            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                              <th className="px-4 py-4 font-semibold">
                                Usuario
                              </th>
                              <th className="px-4 py-4 font-semibold">
                                Correo
                              </th>
                              <th className="px-4 py-4 font-semibold">Rol</th>
                              <th className="px-4 py-4 font-semibold">
                                Estado
                              </th>
                              <th className="px-4 py-4 font-semibold">
                                Creado
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-800 bg-slate-900/30">
                            {filteredMembers.map((companyMember) => {
                              const isCurrentUser =
                                member?.id === companyMember.id;

                              return (
                                <tr
                                  key={companyMember.id}
                                  className="transition hover:bg-slate-800/40"
                                >
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                                        {companyMember.role === "owner" ? (
                                          <Crown className="h-5 w-5" />
                                        ) : (
                                          <Users className="h-5 w-5" />
                                        )}
                                      </div>

                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="font-semibold text-white">
                                            {companyMember.display_name}
                                          </p>

                                          {isCurrentUser && (
                                            <Badge variant="info">Tú</Badge>
                                          )}
                                        </div>

                                        <p className="mt-1 font-mono text-xs text-slate-500">
                                          {companyMember.user_id}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                      <Mail className="h-4 w-4 text-slate-500" />
                                      {companyMember.email}
                                    </div>
                                  </td>

                                  <td className="px-4 py-4">
                                    <Badge
                                      variant={getRoleVariant(
                                        companyMember.role
                                      )}
                                    >
                                      {getRoleLabel(companyMember.role)}
                                    </Badge>
                                  </td>

                                  <td className="px-4 py-4">
                                    <Badge
                                      variant={getStatusVariant(
                                        companyMember.status
                                      )}
                                    >
                                      {getStatusLabel(companyMember.status)}
                                    </Badge>
                                  </td>

                                  <td className="px-4 py-4 text-sm text-slate-400">
                                    {formatDate(companyMember.created_at)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Roles</CardTitle>

                    <CardDescription>
                      Distribución actual de permisos dentro de la empresa.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">
                              Propietarios
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              Control principal de la empresa.
                            </p>
                          </div>

                          <p className="text-2xl font-bold text-white">
                            {stats.owners}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">
                              Administradores
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              Gestión de productos, lotes y usuarios.
                            </p>
                          </div>

                          <p className="text-2xl font-bold text-white">
                            {stats.admins}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">
                              Operadores
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              Uso operativo para generación y exportación.
                            </p>
                          </div>

                          <p className="text-2xl font-bold text-white">
                            {stats.operators}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accesos</CardTitle>

                    <CardDescription>
                      Estado actual del módulo de usuarios.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />

                          <div>
                            <p className="font-medium text-cyan-100">
                              Lectura real activa
                            </p>

                            <p className="mt-1 text-sm text-cyan-200/80">
                              Esta pantalla ya consulta los miembros reales de
                              company_members.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                        <p className="font-medium text-amber-100">
                          Próximo módulo
                        </p>

                        <p className="mt-1 text-sm text-amber-200/80">
                          Después podemos agregar invitación de usuarios con una
                          Edge Function segura para crear miembros nuevos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}