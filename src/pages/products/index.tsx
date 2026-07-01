import { Plus, Search, Package, MoreHorizontal } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Badge from "../../components/ui/badge/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card/Card";

import { mockProducts } from "../../data/products";

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Productos
            </h1>

            <p className="mt-2 text-slate-400">
              Gestiona los productos que luego serán asociados a lotes QR.
            </p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total productos
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {mockProducts.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Package className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">
                Activos
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {mockProducts.filter((product) => product.status === "active").length}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">
                Inactivos
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {mockProducts.filter((product) => product.status === "inactive").length}
              </h2>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle>Listado de productos</CardTitle>

              <CardDescription>
                Productos registrados por la empresa.
              </CardDescription>
            </div>

            <div className="w-full lg:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <Input
                  placeholder="Buscar producto..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      Producto
                    </th>

                    <th className="px-4 py-3 font-medium">
                      SKU
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Categoría
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Estado
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Fecha
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {mockProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="text-slate-300 transition hover:bg-slate-950/60"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {product.name}
                          </p>

                          <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                            {product.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {product.sku}
                      </td>

                      <td className="px-4 py-4">
                        {product.category}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            product.status === "active"
                              ? "success"
                              : "default"
                          }
                        >
                          {product.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        {product.createdAt}
                      </td>

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