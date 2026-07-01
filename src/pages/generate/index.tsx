import { useMemo, useState } from "react";
import {
  FileText,
  Layers,
  Package,
  QrCode,
  ShieldCheck,
  Sparkles,
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

import { mockProducts } from "../../data/products";
import { mockPDFTemplates } from "../../data/pdfTemplates";

export default function GeneratePage() {
  const [productId, setProductId] = useState(mockProducts[0]?.id ?? "");
  const [batchName, setBatchName] = useState("Lote de producción inicial");
  const [quantity, setQuantity] = useState(500);
  const [templateId, setTemplateId] = useState(mockPDFTemplates[0]?.id ?? "");

  const selectedProduct = useMemo(
    () => mockProducts.find((product) => product.id === productId),
    [productId]
  );

  const selectedTemplate = useMemo(
    () => mockPDFTemplates.find((template) => template.id === templateId),
    [templateId]
  );

  const estimatedPages = selectedTemplate
    ? Math.ceil(quantity / selectedTemplate.codesPerPage)
    : 0;

  function handleGenerate() {
    alert(
      "Simulación: aquí luego conectaremos la generación real con HMAC-SHA256, SHA-512 y PDF."
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Generar QR
            </h1>

            <p className="mt-2 text-slate-400">
              Crea lotes de códigos QR seguros y exportables en PDF para impresión.
            </p>
          </div>

          <Badge variant="info">
            Simulación frontend
          </Badge>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo lote QR</CardTitle>

              <CardDescription>
                Define el producto, la cantidad y el formato de impresión.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Producto
                  </label>

                  <select
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {mockProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — {product.sku}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Nombre del lote"
                  value={batchName}
                  onChange={(event) => setBatchName(event.target.value)}
                  placeholder="Ej: Lote Café Premium Julio"
                />

                <Input
                  label="Cantidad de códigos QR"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Number(event.target.value))
                  }
                  placeholder="Ej: 1000"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Plantilla PDF
                  </label>

                  <select
                    value={templateId}
                    onChange={(event) => setTemplateId(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {mockPDFTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} — {template.codesPerPage} QR por página
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 text-cyan-300" />

                    <div>
                      <p className="font-medium text-white">
                        Generación criptográfica segura
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        El backend generará un hash maestro del lote usando
                        HMAC-SHA256 y cada QR individual derivará de ese lote
                        mediante SHA-512.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleGenerate} size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Simular generación del lote
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista previa</CardTitle>

                <CardDescription>
                  Resumen del lote antes de generar los QR.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="text-sm text-slate-400">
                          Producto
                        </p>

                        <p className="font-medium text-white">
                          {selectedProduct?.name ?? "Sin producto"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-cyan-300" />

                      <div>
                        <p className="text-sm text-slate-400">
                          Lote
                        </p>

                        <p className="font-medium text-white">
                          {batchName || "Sin nombre"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <QrCode className="h-5 w-5 text-cyan-300" />

                      <p className="mt-3 text-sm text-slate-400">
                        QR a generar
                      </p>

                      <p className="mt-1 text-2xl font-bold text-white">
                        {quantity.toLocaleString("es-CO")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <FileText className="h-5 w-5 text-cyan-300" />

                      <p className="mt-3 text-sm text-slate-400">
                        Páginas PDF
                      </p>

                      <p className="mt-1 text-2xl font-bold text-white">
                        {estimatedPages}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plantilla seleccionada</CardTitle>
              </CardHeader>

              <CardContent>
                {selectedTemplate && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-white">
                        {selectedTemplate.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {selectedTemplate.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">
                          Página
                        </p>

                        <p className="mt-1 font-medium text-white">
                          {selectedTemplate.pageSize}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">
                          Columnas
                        </p>

                        <p className="mt-1 font-medium text-white">
                          {selectedTemplate.columns}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">
                          Filas
                        </p>

                        <p className="mt-1 font-medium text-white">
                          {selectedTemplate.rows}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                      <p className="text-sm text-cyan-200">
                        Este lote generará aproximadamente{" "}
                        <strong>{estimatedPages}</strong> página(s) PDF listas
                        para descargar o imprimir.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}