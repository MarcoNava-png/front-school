"use client";

import { useEffect, useState } from "react";

import { CheckCircle, DollarSign, FileText, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listReceiptsByPeriod } from "@/services/receipts-service";
import { Receipt, ReceiptStatus } from "@/types/receipt";

interface StudentPaymentsModalProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  currentPeriodId?: number;
}

export function StudentPaymentsModal({
  open,
  onClose,
  studentId,
  studentName,
  currentPeriodId,
}: StudentPaymentsModalProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && currentPeriodId) {
      loadReceipts();
    }
  }, [open, studentId, currentPeriodId]);

  const loadReceipts = async () => {
    if (!currentPeriodId) {
      toast.error("No hay un periodo académico seleccionado");
      return;
    }

    setLoading(true);
    try {
      const data = await listReceiptsByPeriod(currentPeriodId, studentId);
      setReceipts(data);
    } catch (error) {
      console.error("Error al cargar recibos:", error);
      toast.error("Error al cargar los recibos del estudiante");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.PAGADO:
        return <Badge className="bg-green-500">Pagado</Badge>;
      case ReceiptStatus.PARCIAL:
        return <Badge className="bg-yellow-500">Parcial</Badge>;
      case ReceiptStatus.PENDIENTE:
        return <Badge variant="outline">Pendiente</Badge>;
      case ReceiptStatus.VENCIDO:
        return <Badge variant="destructive">Vencido</Badge>;
      case ReceiptStatus.CANCELADO:
        return <Badge variant="secondary">Cancelado</Badge>;
      case ReceiptStatus.BONIFICADO:
        return <Badge className="bg-blue-500">Bonificado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX");
  };

  const totalDeuda = receipts.reduce((sum, r) => sum + r.saldo, 0);
  const totalPagado = receipts.reduce((sum, r) => sum + (r.total - r.saldo), 0);
  const totalGeneral = receipts.reduce((sum, r) => sum + r.total, 0);

  const isPaidUp = totalDeuda === 0 && receipts.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Estado de Pagos - {studentName}
          </DialogTitle>
          <DialogDescription>
            Recibos y estado de cuenta del estudiante
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Cargando recibos...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Total General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalGeneral)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Total Pagado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPagado)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {totalDeuda > 0 ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    Saldo Pendiente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalDeuda > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(totalDeuda)}
                  </div>
                </CardContent>
              </Card>
            </div>
            {isPaidUp && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">El estudiante está al corriente con sus pagos</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {totalDeuda > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      El estudiante tiene pagos pendientes por {formatCurrency(totalDeuda)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {receipts.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      No hay recibos generados para este estudiante en el periodo actual
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla de recibos */}
            {receipts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalle de Recibos</CardTitle>
                  <CardDescription>
                    {receipts.length} recibo(s) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Folio</TableHead>
                          <TableHead>Fecha Emisión</TableHead>
                          <TableHead>Fecha Vencimiento</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Pagado</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receipts.map((receipt) => (
                          <TableRow key={receipt.idRecibo}>
                            <TableCell className="font-mono text-sm">
                              {receipt.folio || `#${receipt.idRecibo}`}
                            </TableCell>
                            <TableCell>{formatDate(receipt.fechaEmision)}</TableCell>
                            <TableCell>{formatDate(receipt.fechaVencimiento)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(receipt.total)}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(receipt.total - receipt.saldo)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              <span className={receipt.saldo > 0 ? "text-red-600" : "text-green-600"}>
                                {formatCurrency(receipt.saldo)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(receipt.estatus as ReceiptStatus)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
