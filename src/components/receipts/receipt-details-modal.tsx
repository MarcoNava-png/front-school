"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, calcularRecargo, calcularDiasVencido } from "@/lib/payment-utils";
import { Receipt, ReceiptStatus } from "@/types/receipt";

import { ReceiptStatusBadge } from "./receipt-status-badge";

interface ReceiptDetailsModalProps {
  receipt: Receipt | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptDetailsModal({ receipt, open, onClose }: ReceiptDetailsModalProps) {
  if (!receipt) return null;

  const recargo = calcularRecargo(receipt.fechaVencimiento, receipt.saldo);
  const diasVencido = calcularDiasVencido(receipt.fechaVencimiento);
  const totalAPagar = receipt.saldo + recargo;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalle del Recibo</span>
            <ReceiptStatusBadge status={receipt.estatus as ReceiptStatus} />
          </DialogTitle>
          <DialogDescription>
            Folio: <span className="font-mono font-semibold">{receipt.folio}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Periodo Académico</p>
              <p className="font-medium">{receipt.nombrePeriodo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grupo</p>
              <p className="font-medium">{receipt.codigoGrupo || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
              <p className="font-medium">
                {new Date(receipt.fechaEmision).toLocaleDateString("es-MX")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
              <p className="font-medium">
                {new Date(receipt.fechaVencimiento).toLocaleDateString("es-MX")}
                {diasVencido > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {diasVencido} día(s) vencido
                  </Badge>
                )}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-4">Conceptos</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  {receipt.descuentoBeca && receipt.descuentoBeca > 0 && (
                    <TableHead className="text-right">Desc. Beca</TableHead>
                  )}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.detalles.map((detalle) => (
                  <TableRow key={detalle.idReciboDetalle}>
                    <TableCell>{detalle.descripcion}</TableCell>
                    <TableCell className="text-right">{detalle.cantidad}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(detalle.precioUnitario)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(detalle.importe)}
                    </TableCell>
                    {receipt.descuentoBeca && receipt.descuentoBeca > 0 && (
                      <TableCell className="text-right text-green-600">
                        -{formatCurrency(detalle.descuentoBeca || 0)}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(detalle.importeNeto || detalle.importe)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(receipt.subtotal)}</span>
            </div>

            {receipt.descuentoBeca && receipt.descuentoBeca > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento por Beca:</span>
                <span className="font-semibold">-{formatCurrency(receipt.descuentoBeca)}</span>
              </div>
            )}

            {receipt.descuentoAdicional && receipt.descuentoAdicional > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento Adicional:</span>
                <span className="font-semibold">-{formatCurrency(receipt.descuentoAdicional)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold">
              <span>Total del Recibo:</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo Pendiente:</span>
              <span className="font-semibold">{formatCurrency(receipt.saldo)}</span>
            </div>

            {recargo > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Recargo por Mora ({diasVencido} días):</span>
                <span className="font-semibold">+{formatCurrency(recargo)}</span>
              </div>
            )}

            {receipt.saldo > 0 && (
              <div className="flex justify-between text-xl font-bold pt-2">
                <span>Total a Pagar Hoy:</span>
                <span className="text-primary">{formatCurrency(totalAPagar)}</span>
              </div>
            )}
          </div>

          {receipt.notas && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notas:</p>
                <p className="text-sm">{receipt.notas}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Creado por: {receipt.creadoPor || "Sistema"} el{" "}
              {receipt.fechaCreacion
                ? new Date(receipt.fechaCreacion).toLocaleString("es-MX")
                : "N/A"}
            </p>
            {receipt.canceladoPor && (
              <p className="text-red-600">
                Cancelado por: {receipt.canceladoPor} el{" "}
                {new Date(receipt.fechaCancelacion!).toLocaleString("es-MX")}
                <br />
                Motivo: {receipt.motivoCancelacion}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
