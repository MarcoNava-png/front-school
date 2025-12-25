"use client";
import { useCallback, useEffect, useState } from "react";

import { Calendar, DollarSign, Filter, X } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getPaymentMethods } from "@/services/catalogs-service";
import { corteCaja, PagoDto } from "@/services/payments-service";
import { PaymentMethod } from "@/types/catalog";

import { ApplyPaymentModal } from "./_components/apply-payment-modal";
import { getPaymentsColumns } from "./_components/columns";
import { RegisterPaymentModal } from "./_components/register-payment-modal";

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [openApply, setOpenApply] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PagoDto | null>(null);
  const [payments, setPayments] = useState<PagoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("all");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error al cargar medios de pago:", error);
    }
  };

  const loadPayments = useCallback(async () => {
    if (!fechaInicio || !fechaFin) {
      toast.info("Selecciona un rango de fechas para ver los pagos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = new Date(fechaInicio).toISOString();
      const endDate = new Date(fechaFin + "T23:59:59").toISOString();
      const data = await corteCaja(startDate, endDate);
      let filteredData = data;

      if (selectedMethodId !== "all") {
        filteredData = data.filter((p) => p.idMedioPago.toString() === selectedMethodId);
      }

      setPayments(filteredData);
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      setError("Error al cargar los pagos");
      toast.error("Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, selectedMethodId]);

  useEffect(() => {
    loadPaymentMethods();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setFechaInicio(startOfMonth.toISOString().split("T")[0]);
    setFechaFin(now.toISOString().split("T")[0]);
  }, []);

  const clearFilters = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setFechaInicio(startOfMonth.toISOString().split("T")[0]);
    setFechaFin(now.toISOString().split("T")[0]);
    setSelectedMethodId("all");
  };

  const handleApplyPayment = (pago: PagoDto) => {
    setSelectedPayment(pago);
    setOpenApply(true);
  };

  const total = payments.reduce((sum, p) => sum + p.monto, 0);

  const table = useDataTableInstance({
    data: payments,
    columns: getPaymentsColumns(loadPayments, handleApplyPayment),
    getRowId: (row) => row.idPago.toString(),
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pagos</h1>
          <p className="text-sm text-muted-foreground">Gestiona los pagos registrados en el sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)} variant="default">
            <DollarSign className="w-4 h-4 mr-2" />
            Registrar Pago
          </Button>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-2">
            <Label htmlFor="fechaInicio" className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha Inicio
            </Label>
            <Input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin" className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha Fin
            </Label>
            <Input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medioPago" className="text-sm font-semibold">
              Medio de Pago
            </Label>
            <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Todos los medios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los medios</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.idMedioPago} value={method.idMedioPago.toString()}>
                    {method.descripcion ?? method.clave}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col justify-end gap-2">
            <Button onClick={loadPayments} disabled={loading} className="w-full">
              {loading ? "Buscando..." : "Buscar Pagos"}
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
              <X className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">Total de Pagos</p>
            <p className="text-2xl font-bold text-blue-900">{payments.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Monto Total</p>
            <p className="text-2xl font-bold text-green-900">
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(total)}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700 font-medium">Promedio</p>
            <p className="text-2xl font-bold text-purple-900">
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
                total / payments.length,
              )}
            </p>
          </div>
        </div>
      )}

      <RegisterPaymentModal open={open} onOpenChange={setOpen} onSuccess={loadPayments} />

      {selectedPayment && (
        <ApplyPaymentModal
          open={openApply}
          onOpenChange={setOpenApply}
          onSuccess={loadPayments}
          idPago={selectedPayment.idPago}
          montoPago={selectedPayment.monto}
        />
      )}

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando pagos...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : payments.length === 0 ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay pagos en el rango seleccionado</p>
            <p className="text-gray-500 text-sm mt-1">Selecciona un rango de fechas y haz clic en Buscar Pagos</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <DataTable table={table} columns={getPaymentsColumns(loadPayments, handleApplyPayment)} />
          </div>
          <DataTablePagination table={table} />
        </>
      )}
    </div>
  );
}
