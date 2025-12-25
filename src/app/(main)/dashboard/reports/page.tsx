"use client";

import { useState } from "react";

import { BarChart3, Calendar, Download, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<string>("corte-caja");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("1");

  const handleGenerateReport = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Selecciona un rango de fechas");
      return;
    }

    setLoading(true);
    try {
      // Aquí se implementaría la generación del reporte
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      toast.error("Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes Financieros</h1>
          <p className="text-sm text-muted-foreground">Genera reportes de pagos, recibos y estadísticas</p>
        </div>
      </div>

      <Tabs defaultValue="corte-caja" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="corte-caja">Corte de Caja</TabsTrigger>
          <TabsTrigger value="recibos">Recibos</TabsTrigger>
          <TabsTrigger value="cobranza">Cobranza</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Corte de Caja */}
        <TabsContent value="corte-caja" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Corte de Caja
              </CardTitle>
              <CardDescription>Reporte de pagos recibidos en un periodo específico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input id="fechaFin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerateReport} disabled={loading} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? "Generando..." : "Generar Reporte"}
                </Button>
                <Button variant="outline" disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumen estadístico (placeholder) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Pagos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monto Total</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00 MXN</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Promedio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00 MXN</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reporte de Recibos */}
        <TabsContent value="recibos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reporte de Recibos
              </CardTitle>
              <CardDescription>Estado de recibos por periodo académico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Periodo Académico</Label>
                  <Input
                    id="periodo"
                    type="number"
                    value={idPeriodoAcademico}
                    onChange={(e) => setIdPeriodoAcademico(e.target.value)}
                    placeholder="ID del periodo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estatus">Estatus</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estatus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="0">Pendiente</SelectItem>
                      <SelectItem value="1">Parcial</SelectItem>
                      <SelectItem value="2">Pagado</SelectItem>
                      <SelectItem value="3">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerateReport} disabled={loading} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? "Generando..." : "Generar Reporte"}
                </Button>
                <Button variant="outline" disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Cobranza */}
        <TabsContent value="cobranza" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Reporte de Cobranza
              </CardTitle>
              <CardDescription>Análisis de cuentas por cobrar y morosidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo-cobranza">Periodo Académico</Label>
                  <Input
                    id="periodo-cobranza"
                    type="number"
                    value={idPeriodoAcademico}
                    onChange={(e) => setIdPeriodoAcademico(e.target.value)}
                    placeholder="ID del periodo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corte">Fecha de Corte</Label>
                  <Input
                    id="corte"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {loading ? "Generando..." : "Generar Reporte de Cobranza"}
              </Button>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Este reporte mostrará los recibos vencidos, parcialmente pagados y pendientes por estudiante.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estadísticas */}
        <TabsContent value="estadisticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Estadísticas Generales
              </CardTitle>
              <CardDescription>Métricas y análisis financiero del periodo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="periodo-stats">Periodo Académico</Label>
                <Input
                  id="periodo-stats"
                  type="number"
                  value={idPeriodoAcademico}
                  onChange={(e) => setIdPeriodoAcademico(e.target.value)}
                  placeholder="ID del periodo"
                />
              </div>

              <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                {loading ? "Generando..." : "Ver Estadísticas"}
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Tasa de Cobranza</p>
                  <p className="text-3xl font-bold text-green-600">0%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Recibos Vencidos</p>
                  <p className="text-3xl font-bold text-red-600">0</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Monto por Cobrar</p>
                  <p className="text-3xl font-bold text-orange-600">$0.00</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Monto Cobrado</p>
                  <p className="text-3xl font-bold text-blue-600">$0.00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los reportes se generan en tiempo real basados en la información de la base de datos.
          Para reportes históricos, asegúrate de seleccionar el periodo académico correcto.
        </p>
      </div>
    </div>
  );
}
