"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Download,
  Eye,
  Ban,
  DollarSign,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Receipt, ReceiptStatus } from "@/types/receipt";
import {
  listarRecibos,
  cancelarRecibo,
  descargarReciboPDF,
  obtenerCarteraVencida,
  obtenerIngresosPorPeriodo,
  exportarCarteraVencida,
  exportarIngresosPeriodo,
} from "@/services/receipts-service";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { AcademicPeriod } from "@/types/academic-period";
import { ReceiptStatusBadge } from "@/components/receipts/receipt-status-badge";
import { ReceiptDetailsModal } from "@/components/receipts/receipt-details-modal";
import {
  formatCurrency,
  calcularRecargo,
  calcularDiasVencido,
  descargarReciboPDF as descargarPDF,
  descargarExcel,
} from "@/lib/payment-utils";

export default function ReceiptsAdminPage() {
  const [recibos, setRecibos] = useState<Receipt[]>([]);
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    matricula: "",
    folio: "",
    idPeriodoAcademico: "TODOS",
    estatus: "TODOS",
    soloVencidos: false,
  });

  // Modales
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  // Reportes
  const [loadingReporte, setLoadingReporte] = useState(false);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (filtros.matricula || filtros.folio || filtros.idPeriodoAcademico) {
      buscarRecibos();
    }
  }, [filtros]);

  async function cargarPeriodos() {
    try {
      const data = await getAcademicPeriodsList();
      setPeriodos(data.items);
    } catch (error) {
      console.error("Error al cargar periodos:", error);
    }
  }

  async function buscarRecibos() {
    setLoading(true);
    try {
      const params: any = {};

      if (filtros.matricula) params.matricula = filtros.matricula;
      if (filtros.folio) params.folio = filtros.folio;
      if (filtros.idPeriodoAcademico && filtros.idPeriodoAcademico !== "TODOS") {
        params.idPeriodoAcademico = parseInt(filtros.idPeriodoAcademico);
      }
      if (filtros.estatus !== "TODOS") {
        params.estatus = parseInt(filtros.estatus);
      }
      if (filtros.soloVencidos) {
        params.soloVencidos = true;
      }

      const data = await listarRecibos(params);
      setRecibos(data);
    } catch (error) {
      toast.error("Error al buscar recibos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelarRecibo() {
    if (!selectedReceipt || !motivoCancelacion.trim()) {
      toast.error("Ingresa el motivo de la cancelación");
      return;
    }

    try {
      await cancelarRecibo(selectedReceipt.idRecibo, motivoCancelacion);
      toast.success("Recibo cancelado exitosamente");
      setCancelModalOpen(false);
      setSelectedReceipt(null);
      setMotivoCancelacion("");
      buscarRecibos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar recibo");
    }
  }

  async function handleDescargarPDF(recibo: Receipt) {
    try {
      const blob = await descargarReciboPDF(recibo.idRecibo);
      descargarPDF(blob, recibo.folio!);
      toast.success("Recibo descargado");
    } catch (error) {
      toast.error("Error al descargar recibo");
    }
  }

  async function exportarCartera() {
    setLoadingReporte(true);
    try {
      const blob = await exportarCarteraVencida(
        filtros.idPeriodoAcademico ? parseInt(filtros.idPeriodoAcademico) : undefined
      );
      descargarExcel(blob, "CarteraVencida");
      toast.success("Reporte exportado");
    } catch (error) {
      toast.error("Error al exportar reporte");
    } finally {
      setLoadingReporte(false);
    }
  }

  async function exportarIngresos() {
    if (!filtros.idPeriodoAcademico) {
      toast.error("Selecciona un periodo académico");
      return;
    }

    setLoadingReporte(true);
    try {
      const blob = await exportarIngresosPeriodo(parseInt(filtros.idPeriodoAcademico));
      descargarExcel(blob, `Ingresos_Periodo_${filtros.idPeriodoAcademico}`);
      toast.success("Reporte exportado");
    } catch (error) {
      toast.error("Error al exportar reporte");
    } finally {
      setLoadingReporte(false);
    }
  }

  const totalSaldo = recibos.reduce((sum, r) => sum + r.saldo, 0);
  const recibosVencidos = recibos.filter((r) => r.estatus === ReceiptStatus.VENCIDO);
  const totalRecargos = recibosVencidos.reduce(
    (sum, r) => sum + calcularRecargo(r.fechaVencimiento, r.saldo),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Administración de Recibos
          </h1>
          <p className="text-muted-foreground">
            Consulta, administra y genera reportes de recibos
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCartera} disabled={loadingReporte}>
            <Download className="w-4 h-4 mr-2" />
            Cartera Vencida
          </Button>
          <Button variant="outline" onClick={exportarIngresos} disabled={loadingReporte}>
            <Download className="w-4 h-4 mr-2" />
            Ingresos
          </Button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Recibos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recibos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSaldo)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{recibosVencidos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recargos Acumulados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalRecargos)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Matrícula</Label>
              <Input
                placeholder="Buscar por matrícula"
                value={filtros.matricula}
                onChange={(e) =>
                  setFiltros({ ...filtros, matricula: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Folio</Label>
              <Input
                placeholder="Buscar por folio"
                value={filtros.folio}
                onChange={(e) => setFiltros({ ...filtros, folio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Periodo</Label>
              <Select
                value={filtros.idPeriodoAcademico}
                onValueChange={(v) =>
                  setFiltros({ ...filtros, idPeriodoAcademico: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los periodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {periodos.map((p) => (
                    <SelectItem key={p.idPeriodoAcademico} value={p.idPeriodoAcademico.toString()}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filtros.estatus}
                onValueChange={(v) => setFiltros({ ...filtros, estatus: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value={ReceiptStatus.PENDIENTE.toString()}>
                    Pendientes
                  </SelectItem>
                  <SelectItem value={ReceiptStatus.PARCIAL.toString()}>
                    Pago Parcial
                  </SelectItem>
                  <SelectItem value={ReceiptStatus.VENCIDO.toString()}>Vencidos</SelectItem>
                  <SelectItem value={ReceiptStatus.PAGADO.toString()}>Pagados</SelectItem>
                  <SelectItem value={ReceiptStatus.CANCELADO.toString()}>
                    Cancelados
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="vencidos"
              checked={filtros.soloVencidos}
              onCheckedChange={(checked) =>
                setFiltros({ ...filtros, soloVencidos: checked as boolean })
              }
            />
            <label
              htmlFor="vencidos"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Solo recibos vencidos
            </label>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={buscarRecibos} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados ({recibos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Buscando recibos...</div>
          ) : recibos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron recibos. Usa los filtros para buscar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recibos.map((recibo) => {
                  const diasVencido = calcularDiasVencido(recibo.fechaVencimiento);

                  return (
                    <TableRow key={recibo.idRecibo}>
                      <TableCell className="font-mono">{recibo.folio}</TableCell>
                      <TableCell>
                        {/* TODO: Agregar nombre del estudiante */}
                        ID: {recibo.idEstudiante}
                      </TableCell>
                      <TableCell>{recibo.nombrePeriodo}</TableCell>
                      <TableCell>
                        {new Date(recibo.fechaVencimiento).toLocaleDateString("es-MX")}
                        {diasVencido > 0 && (
                          <div className="text-xs text-red-600">{diasVencido} días</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(recibo.total)}</TableCell>
                      <TableCell className="text-right">
                        {recibo.saldo > 0 ? (
                          <span className="text-red-600">{formatCurrency(recibo.saldo)}</span>
                        ) : (
                          <span className="text-green-600">Pagado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ReceiptStatusBadge status={recibo.estatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReceipt(recibo)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDescargarPDF(recibo)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {recibo.estatus !== ReceiptStatus.CANCELADO &&
                            recibo.estatus !== ReceiptStatus.PAGADO && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedReceipt(recibo);
                                  setCancelModalOpen(true);
                                }}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <ReceiptDetailsModal
        receipt={selectedReceipt}
        open={!!selectedReceipt && !cancelModalOpen}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Modal de Cancelación */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Recibo</DialogTitle>
            <DialogDescription>
              Estás a punto de cancelar el recibo {selectedReceipt?.folio}. Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">
                Motivo de la Cancelación <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivo"
                placeholder="Ingresa el motivo de la cancelación"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelarRecibo}
              disabled={!motivoCancelacion.trim()}
            >
              <Ban className="w-4 h-4 mr-2" />
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
