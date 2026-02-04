"use client";

import { useEffect, useState } from "react";

import {
  FileText,
  Search,
  Download,
  Eye,
  Ban,
  Filter,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { ReceiptDetailsModal } from "@/components/receipts/receipt-details-modal";
import { ReceiptStatusBadge } from "@/components/receipts/receipt-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  formatCurrency,
  calcularRecargo,
  calcularDiasVencido,
  descargarReciboPDF as descargarPDF,
  descargarExcel,
  isPaidOrPartial,
  isCanceledOrPaid,
} from "@/lib/payment-utils";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import {
  listarRecibos,
  cancelarRecibo,
  reversarRecibo,
  descargarReciboPDF,
  exportarCarteraVencida,
  exportarIngresosPeriodo,
} from "@/services/receipts-service";
import { AcademicPeriod } from "@/types/academic-period";
import { Receipt, ReceiptStatus } from "@/types/receipt";

export default function ReceiptsAdminPage() {
  const [recibos, setRecibos] = useState<Receipt[]>([]);
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    matricula: "",
    folio: "",
    idPeriodoAcademico: "TODOS",
    estatus: "TODOS",
    soloVencidos: false,
  });

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [motivoReversion, setMotivoReversion] = useState("");
  const [loadingReverse, setLoadingReverse] = useState(false);

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
      setRecibos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al buscar recibos");
      console.error(error);
      setRecibos([]);
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

  async function handleReversarRecibo() {
    if (!selectedReceipt || !motivoReversion.trim()) {
      toast.error("Ingresa el motivo de la reversión");
      return;
    }

    setLoadingReverse(true);
    try {
      await reversarRecibo(selectedReceipt.idRecibo, motivoReversion);
      toast.success("Recibo reversado exitosamente. Los pagos aplicados han sido eliminados.");
      setReverseModalOpen(false);
      setSelectedReceipt(null);
      setMotivoReversion("");
      buscarRecibos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al reversar recibo");
    } finally {
      setLoadingReverse(false);
    }
  }

  async function handleDescargarPDF(recibo: Receipt) {
    try {
      const blob = await descargarReciboPDF(recibo.idRecibo);
      descargarPDF(blob, recibo.folio!);
      toast.success("Recibo descargado");
    } catch {
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
    } catch {
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
    } catch {
      toast.error("Error al exportar reporte");
    } finally {
      setLoadingReporte(false);
    }
  }

  const totalSaldo = recibos.reduce((sum, r) => sum + r.saldo, 0);
  const recibosVencidos = recibos.filter((r) => {
    const estatusNum = typeof r.estatus === 'number' ? r.estatus :
      (String(r.estatus).toUpperCase() === "VENCIDO" ? ReceiptStatus.VENCIDO : -1);
    return estatusNum === ReceiptStatus.VENCIDO || r.estatus === 3;
  });
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
                        <ReceiptStatusBadge status={recibo.estatus as ReceiptStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReceipt(recibo)}
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDescargarPDF(recibo)}
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {isPaidOrPartial(recibo.estatus) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => {
                                setSelectedReceipt(recibo);
                                setReverseModalOpen(true);
                              }}
                              title="Reversar pagos"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {!isCanceledOrPaid(recibo.estatus) && !isPaidOrPartial(recibo.estatus) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedReceipt(recibo);
                                  setCancelModalOpen(true);
                                }}
                                title="Cancelar recibo"
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
      <ReceiptDetailsModal
        receipt={selectedReceipt}
        open={!!selectedReceipt && !cancelModalOpen}
        onClose={() => setSelectedReceipt(null)}
      />
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

      <Dialog open={reverseModalOpen} onOpenChange={setReverseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              Reversar Recibo
            </DialogTitle>
            <DialogDescription>
              Estás a punto de reversar el recibo <strong>{selectedReceipt?.folio}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Esta acción:</h4>
              <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                <li>Eliminará todos los pagos aplicados a este recibo</li>
                <li>Regresará el saldo a su valor original</li>
                <li>Cambiará el estado del recibo a PENDIENTE</li>
                <li>Se registrará en la bitácora del sistema</li>
              </ul>
            </div>

            {selectedReceipt && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total del recibo:</span>
                  <span className="font-semibold">{formatCurrency(selectedReceipt.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo actual:</span>
                  <span className="font-semibold">{formatCurrency(selectedReceipt.saldo)}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Pagos a reversar:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedReceipt.total - selectedReceipt.saldo)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="motivoReversion">
                Motivo de la Reversión <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivoReversion"
                placeholder="Ingresa el motivo de la reversión (ej: pago duplicado, error de captura, devolución, etc.)"
                value={motivoReversion}
                onChange={(e) => setMotivoReversion(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReverseModalOpen(false);
                setMotivoReversion("");
              }}
              disabled={loadingReverse}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleReversarRecibo}
              disabled={!motivoReversion.trim() || loadingReverse}
            >
              {loadingReverse ? (
                <>Reversando...</>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Confirmar Reversión
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
