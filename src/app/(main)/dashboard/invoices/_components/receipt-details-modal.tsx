"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt, ReceiptStatus } from "@/types/receipt";

interface ReceiptDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
}

const estatusLabels: Record<ReceiptStatus, string> = {
  [ReceiptStatus.PENDIENTE]: "Pendiente",
  [ReceiptStatus.PARCIAL]: "Parcial",
  [ReceiptStatus.PAGADO]: "Pagado",
  [ReceiptStatus.VENCIDO]: "Vencido",
  [ReceiptStatus.CANCELADO]: "Cancelado",
  [ReceiptStatus.BONIFICADO]: "Bonificado",
};

export function ReceiptDetailsModal({ open, onOpenChange, receipt }: ReceiptDetailsModalProps) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalle del Recibo</DialogTitle>
          <DialogDescription>Folio: {receipt.folio ?? "Sin folio"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
              <p className="font-medium">
                {new Date(receipt.fechaEmision).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
              <p className="font-medium">
                {new Date(receipt.fechaVencimiento).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estatus</p>
              <p className="font-medium">{estatusLabels[receipt.estatus as ReceiptStatus]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Periodo Académico</p>
              <p className="font-medium">{receipt.idPeriodoAcademico ?? "N/A"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Conceptos</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Descripción</th>
                    <th className="text-right p-3 text-sm font-medium">Cantidad</th>
                    <th className="text-right p-3 text-sm font-medium">Precio Unit.</th>
                    <th className="text-right p-3 text-sm font-medium">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.detalles.map((detalle) => (
                    <tr key={detalle.idReciboDetalle} className="border-t">
                      <td className="p-3">{detalle.descripcion}</td>
                      <td className="p-3 text-right">{detalle.cantidad}</td>
                      <td className="p-3 text-right">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
                          detalle.precioUnitario,
                        )}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
                          detalle.importe,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm">Subtotal:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(receipt.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Descuento (Beca):</span>
              <span className="font-medium text-green-600">
                -{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(receipt.descuento)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Recargos:</span>
              <span className="font-medium text-red-600">
                +{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(receipt.recargos)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(receipt.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Saldo:</span>
              <span className={`font-bold text-lg ${receipt.saldo > 0 ? "text-red-600" : "text-green-600"}`}>
                {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(receipt.saldo)}
              </span>
            </div>
          </div>

          {receipt.notas && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">Notas:</p>
              <p className="text-sm text-blue-800">{receipt.notas}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
