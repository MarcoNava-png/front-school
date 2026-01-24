"use client";

import { useEffect, useState } from "react";

import { Receipt, DollarSign, Calendar, FileText, Plus, FileSpreadsheet, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { getApplicantReceipts, generateApplicantReceipt, deleteApplicantReceipt, repairReceiptsWithoutDetails } from "@/services/applicants-service";
import { Applicant, ReciboDto, EstatusRecibo } from "@/types/applicant";

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
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [receiptAmount, setReceiptAmount] = useState<string>("600");
  const [receiptConcept, setReceiptConcept] = useState<string>("Cuota de Inscripción");
  const [deletingReceipt, setDeletingReceipt] = useState<number | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<number | null>(null);
  const [confirmRepairOpen, setConfirmRepairOpen] = useState(false);

  useEffect(() => {
    if (open && applicant) {
      loadReceipts();
    }
  }, [open, applicant]);

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
      setShowGenerateForm(false);
      loadReceipts();
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
      if (onPaymentRegistered) {
        onPaymentRegistered();
      }
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
      console.log("Recibos reparados:", result);
      loadReceipts();
      if (onPaymentRegistered) {
        onPaymentRegistered();
      }
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

    return { total, pagado, pendiente };
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
            {/* Resumen de Pagos */}
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

            {/* Formulario de generación de recibo */}
            {showGenerateForm ? (
              <div className="rounded-lg border bg-gray-50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Generar Nuevo Recibo
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGenerateForm(false)}
                    disabled={generatingReceipt}
                  >
                    Cancelar
                  </Button>
                </div>

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
                      placeholder="Cuota de Inscripción"
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
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowGenerateForm(true)}
                className="w-full"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Generar Nuevo Recibo
              </Button>
            )}

            {/* Lista de Recibos */}
            <div className="space-y-3">
              <h3 className="font-semibold">Recibos ({receipts.length})</h3>

              {receipts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No hay recibos generados para este aspirante</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Haz clic en &ldquo;Generar Nuevo Recibo&rdquo; para crear uno
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

                        {/* Detalles del Recibo */}
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

                        {/* Totales */}
                        <div className="mt-3 space-y-1 border-t pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>{formatCurrency(recibo.subtotal)}</span>
                          </div>
                          {recibo.descuento > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Descuento:</span>
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

                        {/* Botón de eliminar (solo si el recibo está pendiente y no tiene pagos) */}
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

      {/* Modal de registro de pago */}
      <PaymentRegistrationModal
        open={paymentModalOpen}
        applicant={applicant}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentRegistered={() => {
          loadReceipts();
          if (onPaymentRegistered) {
            onPaymentRegistered();
          }
        }}
      />

      {/* Modal de confirmación para eliminar recibo */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Recibo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este recibo? Esta acción no se puede deshacer.
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

      {/* Modal de confirmación para reparar recibos */}
      <AlertDialog open={confirmRepairOpen} onOpenChange={setConfirmRepairOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reparar Recibos</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas reparar todos los recibos sin detalles? Esto agregará líneas de detalle a los recibos que no las tienen.
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
