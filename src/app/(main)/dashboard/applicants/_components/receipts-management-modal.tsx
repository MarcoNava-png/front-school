"use client";

import { useEffect, useState } from "react";

import { Receipt, DollarSign, Calendar, FileText, Plus, FileSpreadsheet, Trash2, AlertTriangle, HandCoins } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getApplicantReceipts,
  generateApplicantReceipt,
  generateApplicantReceiptByConcepto,
  deleteApplicantReceipt,
  repairReceiptsWithoutDetails,
  buscarPlantillaParaAspirante,
  generarRecibosDesdeePlantilla,
} from "@/services/applicants-service";
import { listarConceptosPago } from "@/services/conceptos-pago-service";
import { Applicant, ReciboDto, EstatusRecibo, PlantillaCobroAspirante } from "@/types/applicant";
import { ConceptoPago } from "@/types/receipt";

import { PaymentRegistrationModal } from "./payment-registration-modal";

interface ReceiptsManagementModalProps {
  open: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onPaymentRegistered?: () => void;
}

export function ReceiptsManagementModal({ open, applicant, onClose, onPaymentRegistered }: ReceiptsManagementModalProps) {
  const [receipts, setReceipts] = useState<ReciboDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [receiptAmount, setReceiptAmount] = useState<string>("600");
  const [receiptConcept, setReceiptConcept] = useState<string>("Cuota de Inscripcion");
  const [deletingReceipt, setDeletingReceipt] = useState<number | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<number | null>(null);
  const [confirmRepairOpen, setConfirmRepairOpen] = useState(false);

  // Nuevos estados para ConceptoPago
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);
  const [selectedConcepto, setSelectedConcepto] = useState<string>("");

  // Nuevos estados para Plantilla
  const [plantilla, setPlantilla] = useState<PlantillaCobroAspirante | null>(null);
  const [loadingPlantilla, setLoadingPlantilla] = useState(false);
  const [generatingFromPlantilla, setGeneratingFromPlantilla] = useState(false);

  useEffect(() => {
    if (open && applicant) {
      loadAll();
    }
  }, [open, applicant]);

  const loadAll = async () => {
    if (!applicant) return;

    setLoading(true);
    try {
      const [recibosData, conceptosData] = await Promise.all([
        getApplicantReceipts(applicant.idAspirante),
        listarConceptosPago({ soloActivos: true }),
      ]);
      setReceipts(recibosData);
      setConceptos(conceptosData);
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error(error);
    } finally {
      setLoading(false);
    }

    // Cargar plantilla en paralelo (no bloquea)
    setLoadingPlantilla(true);
    try {
      const plantillaData = await buscarPlantillaParaAspirante(applicant.idAspirante);
      setPlantilla(plantillaData);
    } catch {
      setPlantilla(null);
    } finally {
      setLoadingPlantilla(false);
    }
  };

  const loadReceipts = async () => {
    if (!applicant) return;

    setLoading(true);
    try {
      const data = await getApplicantReceipts(applicant.idAspirante);
      setReceipts(data);
    } catch (error) {
      toast.error("Error al cargar recibos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Generar recibo desde ConceptoPago
  const handleGenerateByConcepto = async () => {
    if (!applicant || !selectedConcepto) return;

    setGeneratingReceipt(true);
    try {
      await generateApplicantReceiptByConcepto(applicant.idAspirante, parseInt(selectedConcepto), 7);
      toast.success("Recibo generado exitosamente");
      setSelectedConcepto("");
      loadReceipts();
      onPaymentRegistered?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { Error?: string } }; message?: string };
      toast.error(err?.response?.data?.Error ?? "Error al generar recibo");
      console.error(error);
    } finally {
      setGeneratingReceipt(false);
    }
  };

  // Generar recibos desde Plantilla
  const handleGenerateFromPlantilla = async () => {
    if (!applicant || !plantilla) return;

    setGeneratingFromPlantilla(true);
    try {
      const recibos = await generarRecibosDesdeePlantilla(
        applicant.idAspirante,
        plantilla.idPlantillaCobro,
        false
      );
      toast.success(`Se generaron ${recibos.length} recibo(s) desde la plantilla`);
      loadReceipts();
      onPaymentRegistered?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { Error?: string } }; message?: string };
      toast.error(err?.response?.data?.Error ?? "Error al generar recibos desde plantilla");
      console.error(error);
    } finally {
      setGeneratingFromPlantilla(false);
    }
  };

  // Generar recibo manual
  const handleGenerateReceipt = async () => {
    if (!applicant) return;

    const amount = parseFloat(receiptAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (!receiptConcept.trim()) {
      toast.error("El concepto es requerido");
      return;
    }

    setGeneratingReceipt(true);
    try {
      await generateApplicantReceipt(applicant.idAspirante, amount, receiptConcept, 7);
      toast.success("Recibo generado exitosamente");
      loadReceipts();
      onPaymentRegistered?.();
    } catch (error) {
      toast.error("Error al generar el recibo");
      console.error(error);
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const openDeleteConfirmation = (idRecibo: number) => {
    setReceiptToDelete(idRecibo);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteReceipt = async () => {
    if (!receiptToDelete) return;

    setConfirmDeleteOpen(false);
    setDeletingReceipt(receiptToDelete);
    try {
      await deleteApplicantReceipt(receiptToDelete);
      toast.success("Recibo eliminado exitosamente");
      loadReceipts();
      onPaymentRegistered?.();
    } catch (error: unknown) {
      const err = error as {response?: {data?: {Error?: string}}, message?: string};
      const errorMessage = err?.response?.data?.Error ?? err?.message ?? "Error al eliminar el recibo";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setDeletingReceipt(null);
      setReceiptToDelete(null);
    }
  };

  const handleRepairReceipts = async () => {
    setConfirmRepairOpen(false);
    setRepairing(true);
    try {
      const result = await repairReceiptsWithoutDetails();
      toast.success(result.mensaje);
      loadReceipts();
      onPaymentRegistered?.();
    } catch (error: unknown) {
      const err = error as {response?: {data?: {Error?: string}}, message?: string};
      const errorMessage = err?.response?.data?.Error ?? err?.message ?? "Error al reparar recibos";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setRepairing(false);
    }
  };

  const getStatusBadgeClass = (estatus: EstatusRecibo) => {
    switch (estatus) {
      case EstatusRecibo.PAGADO:
        return "bg-green-100 text-green-700";
      case EstatusRecibo.PARCIAL:
        return "bg-yellow-100 text-yellow-700";
      case EstatusRecibo.PENDIENTE:
        return "bg-orange-100 text-orange-700";
      case EstatusRecibo.VENCIDO:
        return "bg-red-100 text-red-700";
      case EstatusRecibo.CANCELADO:
        return "bg-gray-100 text-gray-700";
      case EstatusRecibo.BONIFICADO:
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (estatus: EstatusRecibo) => {
    switch (estatus) {
      case EstatusRecibo.PAGADO:
        return "Pagado";
      case EstatusRecibo.PARCIAL:
        return "Pago Parcial";
      case EstatusRecibo.PENDIENTE:
        return "Pendiente";
      case EstatusRecibo.VENCIDO:
        return "Vencido";
      case EstatusRecibo.CANCELADO:
        return "Cancelado";
      case EstatusRecibo.BONIFICADO:
        return "Bonificado";
      default:
        return "Desconocido";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalStats = () => {
    const total = receipts.reduce((sum, r) => sum + r.total, 0);
    const pagado = receipts.reduce((sum, r) => sum + (r.total - r.saldo), 0);
    const pendiente = receipts.reduce((sum, r) => sum + r.saldo, 0);
    const descuentoTotal = receipts.reduce((sum, r) => sum + r.descuento, 0);

    return { total, pagado, pendiente, descuentoTotal };
  };

  if (!applicant) return null;

  const stats = getTotalStats();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Recibos y Pagos - {applicant.nombreCompleto}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Cargando recibos...</div>
        ) : (
          <div className="space-y-6">
            {/* Estadisticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-blue-50 p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total a Pagar</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-900">{formatCurrency(stats.total)}</p>
              </div>

              <div className="rounded-lg border bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Total Pagado</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-green-900">{formatCurrency(stats.pagado)}</p>
              </div>

              <div className="rounded-lg border bg-orange-50 p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Saldo Pendiente</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-orange-900">{formatCurrency(stats.pendiente)}</p>
              </div>
            </div>

            {/* Panel de descuentos de convenio */}
            {stats.descuentoTotal > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <HandCoins className="h-4 w-4" />
                  Descuento por convenio aplicado: {formatCurrency(stats.descuentoTotal)}
                </div>
              </div>
            )}

            {/* Seccion de generacion con Tabs */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FileSpreadsheet className="h-5 w-5" />
                Generar Nuevo Recibo
              </h3>

              <Tabs defaultValue="concepto" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="concepto">Por Concepto</TabsTrigger>
                  <TabsTrigger value="plantilla">Desde Plantilla</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>

                {/* Tab: Por Concepto */}
                <TabsContent value="concepto" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Concepto de Pago</Label>
                    <Select value={selectedConcepto} onValueChange={setSelectedConcepto}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un concepto de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        {conceptos.map((c) => (
                          <SelectItem key={c.idConceptoPago} value={c.idConceptoPago.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{c.nombre}</span>
                              <span className="text-xs text-muted-foreground">{c.clave}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleGenerateByConcepto}
                      disabled={!selectedConcepto || generatingReceipt}
                    >
                      {generatingReceipt ? "Generando..." : "Generar Recibo"}
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab: Desde Plantilla */}
                <TabsContent value="plantilla" className="space-y-4 mt-4">
                  {loadingPlantilla ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Buscando plantilla disponible...
                    </div>
                  ) : plantilla ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{plantilla.nombrePlantilla}</h4>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            v{plantilla.version}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {plantilla.nombrePlanEstudios && (
                            <p>Plan: {plantilla.nombrePlanEstudios}</p>
                          )}
                          <p>Cuatrimestre: {plantilla.numeroCuatrimestre}</p>
                          <p>Recibos: {plantilla.numeroRecibos} | Vencimiento dia: {plantilla.diaVencimiento}</p>
                        </div>

                        {plantilla.detalles && plantilla.detalles.length > 0 && (
                          <div className="mt-3 border-t pt-2">
                            <p className="text-xs font-medium mb-1">Conceptos:</p>
                            {plantilla.detalles.map((d) => (
                              <div key={d.idPlantillaDetalle} className="flex justify-between text-xs">
                                <span>{d.descripcion || d.nombreConcepto}</span>
                                <span className="font-medium">{formatCurrency(d.precioUnitario * d.cantidad)}</span>
                              </div>
                            ))}
                            {plantilla.totalConceptos != null && (
                              <div className="flex justify-between text-xs font-semibold mt-1 pt-1 border-t">
                                <span>Total</span>
                                <span>{formatCurrency(plantilla.totalConceptos)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleGenerateFromPlantilla}
                          disabled={generatingFromPlantilla}
                        >
                          {generatingFromPlantilla ? "Generando..." : "Generar Recibos desde Plantilla"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Alert className="border-yellow-300 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700">
                        No se encontro plantilla de cobro para el plan de estudios y cuatrimestre de este aspirante.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                {/* Tab: Manual */}
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="receiptAmount">Monto</Label>
                      <Input
                        id="receiptAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={receiptAmount}
                        onChange={(e) => setReceiptAmount(e.target.value)}
                        placeholder="600.00"
                        disabled={generatingReceipt}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiptConcept">Concepto</Label>
                      <Input
                        id="receiptConcept"
                        type="text"
                        value={receiptConcept}
                        onChange={(e) => setReceiptConcept(e.target.value)}
                        placeholder="Cuota de Inscripcion"
                        disabled={generatingReceipt}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleGenerateReceipt}
                      disabled={generatingReceipt}
                    >
                      {generatingReceipt ? "Generando..." : "Generar Recibo"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Lista de recibos */}
            <div className="space-y-3">
              <h3 className="font-semibold">Recibos ({receipts.length})</h3>

              {receipts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No hay recibos generados para este aspirante</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Usa las opciones de arriba para generar un recibo
                  </p>
                </div>
              ) : (
                receipts.map((recibo) => (
                  <div key={recibo.idRecibo} className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Receipt className="h-5 w-5 text-gray-600" />
                          <div>
                            <h4 className="font-semibold">
                              Folio: {recibo.folio ?? `#${recibo.idRecibo}`}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Emitido: {formatDate(recibo.fechaEmision)} | Vencimiento:{" "}
                              {formatDate(recibo.fechaVencimiento)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          {recibo.detalles.map((detalle) => (
                            <div
                              key={detalle.idReciboDetalle}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {detalle.descripcion} (x{detalle.cantidad})
                              </span>
                              <span className="font-medium">{formatCurrency(detalle.importe)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1 border-t pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>{formatCurrency(recibo.subtotal)}</span>
                          </div>
                          {recibo.descuento > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Descuento (Convenio):</span>
                              <span>-{formatCurrency(recibo.descuento)}</span>
                            </div>
                          )}
                          {recibo.recargos > 0 && (
                            <div className="flex justify-between text-sm text-red-600">
                              <span>Recargos:</span>
                              <span>+{formatCurrency(recibo.recargos)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatCurrency(recibo.total)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Saldo Pendiente:</span>
                            <span className={recibo.saldo > 0 ? "text-orange-600" : "text-green-600"}>
                              {formatCurrency(recibo.saldo)}
                            </span>
                          </div>
                        </div>

                        {recibo.notas && (
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notas:</span> {recibo.notas}
                          </p>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2 items-end">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(recibo.estatus)}`}
                        >
                          {getStatusText(recibo.estatus)}
                        </span>
                        {recibo.saldo === recibo.total && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirmation(recibo.idRecibo)}
                            disabled={deletingReceipt === recibo.idRecibo}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => setPaymentModalOpen(true)}
              disabled={stats.pendiente === 0}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Registrar Pago
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmRepairOpen(true)}
              disabled={repairing}
              className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {repairing ? "Reparando..." : "Reparar Recibos"}
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
      <PaymentRegistrationModal
        open={paymentModalOpen}
        applicant={applicant}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentRegistered={() => {
          loadReceipts();
          onPaymentRegistered?.();
        }}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Recibo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que deseas eliminar este recibo? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReceiptToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReceipt}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRepairOpen} onOpenChange={setConfirmRepairOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reparar Recibos</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas reparar todos los recibos sin detalles? Esto agregara lineas de detalle a los recibos que no las tienen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRepairReceipts}>
              Reparar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
