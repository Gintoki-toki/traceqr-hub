import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Package, Plus, Search, X } from "lucide-react";

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

import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import type { Product } from "../../types/product";
import {
  createProduct,
  getCompanyProducts,
} from "../../services/products/productService";

export default function ProductsPage() {
  const { user } = useAuth();
  const { company } = useCompany();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(value) ||
        product.sku.toLowerCase().includes(value) ||
        product.category?.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  const activeProducts = products.filter(
    (product) => product.status === "active"
  ).length;

  const inactiveProducts = products.filter(
    (product) => product.status === "inactive"
  ).length;

  async function loadProducts() {
    if (!company?.id) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getCompanyProducts(company.id);
      setProducts(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los productos."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [company?.id]);

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company?.id || !user?.id) {
      setErrorMessage("No se encontró la empresa o el usuario actual.");
      return;
    }

    if (!productName || !sku) {
      setErrorMessage("El nombre del producto y el SKU son obligatorios.");
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const newProduct = await createProduct({
        companyId: company.id,
        userId: user.id,
        name: productName,
        sku,
        description,
        category,
      });

      setProducts((currentProducts) => [newProduct, ...currentProducts]);

      setProductName("");
      setSku("");
      setDescription("");
      setCategory("");
      setShowForm(false);

      setSuccessMessage("Producto creado correctamente.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear el producto."
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Productos
            </h1>

            <p className="mt-2 text-slate-400">
              Gestiona los productos reales de {company?.name ?? "tu empresa"}.
            </p>
          </div>

          <Button type="button" onClick={() => setShowForm((value) => !value)}>
            {showForm ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo producto
              </>
            )}
          </Button>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total productos</p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {products.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Package className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">Activos</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {activeProducts}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-400">Inactivos</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {inactiveProducts}
              </h2>
            </CardContent>
          </Card>
        </section>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nuevo producto</CardTitle>

              <CardDescription>
                Este producto quedará asociado a la empresa actual.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateProduct} className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Nombre del producto"
                  placeholder="Ej: Café Premium 500g"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  required
                />

                <Input
                  label="SKU"
                  placeholder="Ej: CAF-PREM-500"
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  required
                />

                <Input
                  label="Categoría"
                  placeholder="Ej: Alimentos"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />

                <Input
                  label="Descripción"
                  placeholder="Descripción corta del producto"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />

                <div className="md:col-span-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creando producto..." : "Crear producto"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle>Listado de productos</CardTitle>

              <CardDescription>
                Productos guardados en la tabla real <strong>products</strong>.
              </CardDescription>
            </div>

            <div className="w-full lg:w-80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <Input
                  placeholder="Buscar producto..."
                  className="pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
                Cargando productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
                <p className="font-medium text-white">No hay productos todavía</p>

                <p className="mt-2 text-sm text-slate-400">
                  Crea tu primer producto para poder generar lotes QR.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium">Categoría</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">Creado</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.map((product) => (
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
                              {product.description ?? "Sin descripción"}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">{product.sku}</td>

                        <td className="px-4 py-4">
                          {product.category ?? "Sin categoría"}
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
                          {new Date(product.created_at).toLocaleDateString(
                            "es-CO"
                          )}
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}