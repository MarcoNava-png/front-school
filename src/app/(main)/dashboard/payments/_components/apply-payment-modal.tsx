"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { aplicarPago } from "@/services/payments-service";
import { listReceiptsByPeriod } from "@/services/receipts-service";
import { Receipt, ReceiptStatus } from "@/types/receipt";

interface ApplyPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  idPago: number;
  montoPago: number;
}

export function ApplyPaymentModal({ open, onOpenChange, onSuccess, idPago, montoPago }: ApplyPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [idEstudiante, setIdEstudiante] = useState<string>("");
  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("1");
  const [aplicaciones, setAplicaciones] = useState<{ idReciboDetalle: number; monto: number }[]>([]);

  const loadReceipts = async () => {
    if (!idEstudiante || !idPeriodoAcademico) return;

    try {
      const data = await listReceiptsByPeriod(parseInt(idPeriodoAcademico), parseInt(idEstudiante));
      // Filtrar solo recibos con saldo pendiente
      const pendientes = data.filter(
        (r) => r.saldo > 0 && (r.estatus === ReceiptStatus.PENDIENTE || r.estatus === ReceiptStatus.PARCIAL),
      );
      setReceipts(pendientes);
    } catch (error) {
      console.error("Error loading receipts:", error);
      toast.error("Error al cargar recibos del estudiante");
    }
  };

  useEffect(() => {
    if (open) {
      setAplicaciones([]);
      setReceipts([]);
      setIdEstudiante("");
    }
  }, [open]);

  const handleAddAplicacion = (idReciboDetalle: number, maxMonto: number) => {
    const montoAplicado = aplicaciones.reduce((sum, a) => sum + a.monto, 0);
    const disponible = montoPago - montoAplicado;

    if (disponible <= 0) {
      toast.error("El pago ya está completamente aplicado");
      return;
    }

    const montoAAplicar = Math.min(disponible, maxMonto);

    setAplicaciones([...aplicaciones, { idReciboDetalle, monto: montoAAplicar }]);
  };

  const handleRemoveAplicacion = (index: number) => {
    setAplicaciones(aplicaciones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (aplicaciones.length === 0) {
      toast.error("Debes aplicar el pago a al menos un recibo");
      return;
    }

    const totalAplicado = aplicaciones.reduce((sum, a) => sum + a.monto, 0);
    if (totalAplicado > montoPago) {
      toast.error("El monto aplicado excede el monto del pago");
      return;
    }

    setLoading(true);

    try {
      await aplicarPago({ idPago, aplicaciones });
      toast.success("Pago aplicado exitosamente");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error applying payment:", error);
      toast.error("Error al aplicar el pago");
    } finally {
      setLoading(false);
    }
  };

  const montoAplicado = aplicaciones.reduce((sum, a) => sum + a.monto, 0);
  const disponible = montoPago - montoAplicado;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Aplicar Pago a Recibos</DialogTitle>
            <DialogDescription>
              Pago ID: {idPago} - Monto:{" "}
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(montoPago)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Buscar estudiante */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="idEstudiante">ID Estudiante</Label>
                <Input
                  id="idEstudiante"
                  type="number"
                  value={idEstudiante}
                  onChange={(e) => setIdEstudiante(e.target.value)}
                  placeholder="Ingresa ID del estudiante"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idPeriodo">ID Periodo</Label>
                <Input
                  id="idPeriodo"
                  type="number"
                  value={idPeriodoAcademico}
                  onChange={(e) => setIdPeriodoAcademico(e.target.value)}
                />
              </div>
            </div>

            <Button type="button" onClick={loadReceipts} variant="outline" className="w-full">
              Buscar Recibos del Estudiante
            </Button>

            {/* Resumen de aplicación */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Monto del Pago:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(montoPago)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Monto Aplicado:</span>
                <span className="font-bold text-green-600">
                  {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(montoAplicado)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Disponible:</span>
                <span className="font-bold text-orange-600">
                  {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(disponible)}
                </span>
              </div>
            </div>

            {/* Recibos disponibles */}
            {receipts.length > 0 && (
              <div className="space-y-2">
                <Label>Recibos con Saldo Pendiente</Label>
                <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                  {receipts.map((receipt) => (
                    <div key={receipt.idRecibo} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Folio: {receipt.folio ?? "N/A"} - Saldo:{" "}
                          {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(receipt.saldo)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {receipt.detalles.map((d) => d.descripcion).join(", ")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddAplicacion(receipt.detalles[0]?.idReciboDetalle, receipt.saldo)}
                        disabled={!receipt.detalles[0] || disponible <= 0}
                      >
                        Aplicar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aplicaciones actuales */}
            {aplicaciones.length > 0 && (
              <div className="space-y-2">
                <Label>Aplicaciones</Label>
                <div className="border rounded-lg">
                  {aplicaciones.map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">Recibo Detalle ID: {app.idReciboDetalle}</p>
                        <p className="text-sm text-muted-foreground">
                          Monto: {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(app.monto)}
                        </p>
                      </div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveAplicacion(index)}>
                        Quitar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || aplicaciones.length === 0}>
              {loading ? "Aplicando..." : "Aplicar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
