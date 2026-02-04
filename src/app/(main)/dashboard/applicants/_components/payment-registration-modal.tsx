"use client";

import { useEffect, useState } from "react";

import { DollarSign, CreditCard, Receipt, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApplicantReceipts } from "@/services/applicants-service";
import { getPaymentMethods } from "@/services/catalogs-service";
import { registrarYAplicarPago } from "@/services/payments-service";
import { Applicant, ReciboDto } from "@/types/applicant";
import { PaymentMethod } from "@/types/catalog";

interface PaymentRegistrationModalProps {
  open: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onPaymentRegistered: () => void;
}

export function PaymentRegistrationModal({
  open,
  applicant,
  onClose,
  onPaymentRegistered,
}: PaymentRegistrationModalProps) {
  const [receipts, setReceipts] = useState<ReciboDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [monto, setMonto] = useState<string>("");
  const [idMedioPago, setIdMedioPago] = useState<string>("");
  const [referencia, setReferencia] = useState<string>("");
  const [notas, setNotas] = useState<string>("");
  const [selectedReceipts, setSelectedReceipts] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (open && applicant) {
      loadData();
    } else {
      resetForm();
    }
  }, [open, applicant]);

  const loadData = async () => {
    if (!applicant) return;

    setLoading(true);
    try {
      console.log("=== PASO 1: REPARACIÓN PREVENTIVA ===");
      try {
        const { repairReceiptsWithoutDetails } = await import("@/services/applicants-service");
        const resultadoReparacion = await repairReceiptsWithoutDetails();
        console.log("Reparación completada:", resultadoReparacion);
        if (resultadoReparacion.reparados > 0) {
          toast.success(`${resultadoReparacion.mensaje}`);
        }
      } catch (repairError: any) {
        console.warn("Error en reparación:", repairError);
      }

      console.log("=== PASO 2: CARGANDO RECIBOS ===");
      const [receiptsData, paymentMethodsData] = await Promise.all([
        getApplicantReceipts(applicant.idAspirante),
        getPaymentMethods(),
      ]);

      const pendingReceipts = receiptsData.filter((r) => r.saldo > 0);
      console.log(`Total: ${receiptsData.length}, Pendientes: ${pendingReceipts.length}`);

      console.log("=== PASO 3: VERIFICANDO DETALLES ===");
      pendingReceipts.forEach((r) => {
        console.log(`Recibo ${r.idRecibo}: ${r.detalles?.length ?? 0} detalles`);
        if (r.detalles) {
          r.detalles.forEach((d) => {
            console.log(`  - Detalle ${d.idReciboDetalle}: ${d.descripcion} = ${d.importe}`);
          });
        }
      });

      setReceipts(pendingReceipts);
      setPaymentMethods(paymentMethodsData);
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMonto("");
    setIdMedioPago("");
    setReferencia("");
    setNotas("");
    setSelectedReceipts(new Map());
  };

  const handleReceiptSelection = (reciboId: number, checked: boolean, maxAmount: number) => {
    const newSelection = new Map(selectedReceipts);
    if (checked) {
      newSelection.set(reciboId, maxAmount);
    } else {
      newSelection.delete(reciboId);
    }
    setSelectedReceipts(newSelection);

    const total = Array.from(newSelection.values()).reduce((sum, amount) => sum + amount, 0);
    setMonto(total.toFixed(2));
  };

  const handleAmountChange = (reciboId: number, value: string) => {
    const amount = parseFloat(value) ?? 0;
    const receipt = receipts.find((r) => r.idRecibo === reciboId);
    if (!receipt) return;

    const maxAmount = receipt.saldo;
    const finalAmount = Math.min(amount, maxAmount);

    const newSelection = new Map(selectedReceipts);
    newSelection.set(reciboId, finalAmount);
    setSelectedReceipts(newSelection);

    const total = Array.from(newSelection.values()).reduce((sum, amt) => sum + amt, 0);
    setMonto(total.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 handleSubmit iniciado");

    if (!applicant || !monto || !idMedioPago) {
      console.error("Validación fallida: campos requeridos faltantes");
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    if (selectedReceipts.size === 0) {
      console.error("Validación fallida: no hay recibos seleccionados");
      toast.error("Debe seleccionar al menos un recibo");
      return;
    }

    const montoNum = parseFloat(monto);
    const totalSelected = Array.from(selectedReceipts.values()).reduce((sum, amt) => sum + amt, 0);

    console.log(`Monto ingresado: ${montoNum}, Total seleccionado: ${totalSelected}`);

    if (Math.abs(montoNum - totalSelected) > 0.01) {
      console.error(`Validación fallida: montos no coinciden (${montoNum} vs ${totalSelected})`);
      toast.error("El monto total no coincide con la suma de los recibos seleccionados");
      return;
    }

    console.log("Todas las validaciones pasaron. Procesando pago...");
    setSubmitting(true);
    try {
      console.log("=== PROCESANDO PAGOS CON NUEVO ENDPOINT ===");
      console.log("Aspirante ID:", applicant.idAspirante);
      console.log("Monto total:", montoNum);
      console.log("Medio de pago:", idMedioPago);
      console.log("Recibos seleccionados:", Array.from(selectedReceipts.entries()));

      const resultados = [];
      for (const [reciboId, montoRecibo] of selectedReceipts.entries()) {
        console.log(`📋 Procesando recibo ${reciboId} con monto $${montoRecibo}`);

        const resultado = await registrarYAplicarPago({
          idRecibo: reciboId,
          idMedioPago: parseInt(idMedioPago),
          monto: montoRecibo,
          referencia: referencia || undefined,
          notas: notas || undefined,
        });

        console.log(`  Recibo ${reciboId} procesado:`, resultado);
        console.log(`   Saldo: ${resultado.saldoAnterior} → ${resultado.saldoNuevo}`);
        console.log(`   Estatus: ${resultado.estatusReciboAnterior} → ${resultado.estatusReciboNuevo}`);

        resultados.push(resultado);
      }

      const todosCompletados = resultados.every(r => r.reciboPagadoCompletamente);
      const totalAplicado = resultados.reduce((sum, r) => sum + r.montoAplicado, 0);

      console.log(`=== RESUMEN ===`);
      console.log(`Total aplicado: $${totalAplicado}`);
      console.log(`Todos completados: ${todosCompletados}`);

      if (todosCompletados) {
        toast.success(" Todos los recibos fueron pagados completamente");
      } else {
        toast.success(` Pago aplicado. Total: $${totalAplicado.toFixed(2)}`);
      }

      console.log(" Recargando lista de aspirantes...");
      onPaymentRegistered();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("=== ERROR AL REGISTRAR PAGO ===");
      console.error("Error completo:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Error al registrar el pago";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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
      month: "short",
      day: "numeric",
    });
  };

  const totalSelected = Array.from(selectedReceipts.values()).reduce((sum, amt) => sum + amt, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Registrar Pago - {applicant?.nombreCompleto}
          </DialogTitle>
          <DialogDescription>
            Complete la información del pago y seleccione los recibos a los que desea aplicarlo
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Cargando datos...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Información del Pago
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idMedioPago" className="text-xs">
                    Medio de Pago <span className="text-red-500">*</span>
                  </Label>
                  <Select value={idMedioPago} onValueChange={setIdMedioPago} required>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.idMedioPago} value={method.idMedioPago.toString()} className="text-xs">
                          {method.descripcion ?? method.clave}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto" className="text-xs">
                    Monto Total <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    className="text-xs"
                    required
                    disabled
                  />
                  <p className="text-[10px] text-gray-500">El monto se calcula automáticamente según los recibos seleccionados</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referencia" className="text-xs">
                    Referencia / No. de Transacción
                  </Label>
                  <Input
                    id="referencia"
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Ej: Transferencia #12345"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas" className="text-xs">
                    Notas
                  </Label>
                  <Textarea
                    id="notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Recibos Pendientes ({receipts.length})
              </h3>

              {receipts.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No hay recibos pendientes de pago</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receipts.map((receipt) => {
                    const isSelected = selectedReceipts.has(receipt.idRecibo);
                    const selectedAmount = selectedReceipts.get(receipt.idRecibo) ?? receipt.saldo;

                    return (
                      <div
                        key={receipt.idRecibo}
                        className={`border rounded-lg p-3 space-y-2 transition-colors ${
                          isSelected ? "bg-blue-50 border-blue-300" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleReceiptSelection(receipt.idRecibo, checked as boolean, receipt.saldo)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold">
                                  Recibo {receipt.folio ?? `#${receipt.idRecibo}`}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  Emitido: {formatDate(receipt.fechaEmision)} | Vence: {formatDate(receipt.fechaVencimiento)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-gray-900">{formatCurrency(receipt.total)}</p>
                                <p className="text-[10px] text-red-600">Saldo: {formatCurrency(receipt.saldo)}</p>
                              </div>
                            </div>

                            {receipt.detalles.length > 0 && (
                              <div className="text-[10px] text-gray-600 space-y-0.5 mt-2">
                                {receipt.detalles.map((detalle) => (
                                  <div key={detalle.idReciboDetalle} className="flex justify-between">
                                    <span>• {detalle.descripcion}</span>
                                    <span>{formatCurrency(detalle.importe)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {isSelected && (
                              <div className="mt-2 pt-2 border-t">
                                <Label htmlFor={`amount-${receipt.idRecibo}`} className="text-[10px]">
                                  Monto a aplicar a este recibo:
                                </Label>
                                <Input
                                  id={`amount-${receipt.idRecibo}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={receipt.saldo}
                                  value={selectedAmount}
                                  onChange={(e) => handleAmountChange(receipt.idRecibo, e.target.value)}
                                  className="text-xs mt-1"
                                />
                                <p className="text-[9px] text-gray-500 mt-0.5">
                                  Máximo: {formatCurrency(receipt.saldo)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedReceipts.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm text-blue-900">Resumen del Pago</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Recibos seleccionados:</span>
                    <span className="font-semibold">{selectedReceipts.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto total a aplicar:</span>
                    <span className="font-bold text-blue-900">{formatCurrency(totalSelected)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="text-xs">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || selectedReceipts.size === 0 || !idMedioPago}
                className="text-xs"
              >
                {submitting ? "Procesando..." : "Registrar Pago"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
