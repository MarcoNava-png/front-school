"use client";

import { useCallback, useState } from "react";

import { FileText, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { listReceiptsByPeriod } from "@/services/receipts-service";
import { Receipt, ReceiptStatus } from "@/types/receipt";

import { getReceiptsColumns } from "./_components/columns";
import { GenerateReceiptsModal } from "./_components/generate-receipts-modal";
import { ReceiptDetailsModal } from "./_components/receipt-details-modal";

export default function InvoicesPage() {
  const [openGenerate, setOpenGenerate] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<number>(1);
  const [idEstudiante, setIdEstudiante] = useState<string>("");
  const [estatusFilter, setEstatusFilter] = useState<string>("all");

  const loadReceipts = useCallback(async () => {
    if (!idPeriodoAcademico) {
      toast.info("Selecciona un periodo académico");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const studentId = idEstudiante ? parseInt(idEstudiante) : undefined;
      const data = await listReceiptsByPeriod(idPeriodoAcademico, studentId);

      let filteredData = data;
      if (estatusFilter !== "all") {
        filteredData = data.filter((r) => r.estatus.toString() === estatusFilter);
      }

      setReceipts(filteredData);
    } catch (err) {
      console.error("Error al cargar recibos:", err);
      setError("Error al cargar los recibos");
      toast.error("Error al cargar los recibos");
    } finally {
      setLoading(false);
    }
  }, [idPeriodoAcademico, idEstudiante, estatusFilter]);

  const handleViewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setOpenDetails(true);
  };

  const clearFilters = () => {
    setIdPeriodoAcademico(1);
    setIdEstudiante("");
    setEstatusFilter("all");
  };

  const totalRecibos = receipts.length;
  const totalMonto = receipts.reduce((sum, r) => sum + r.total, 0);
  const totalSaldo = receipts.reduce((sum, r) => sum + r.saldo, 0);

  const table = useDataTableInstance({
    data: receipts,
    columns: getReceiptsColumns(handleViewDetails),
    getRowId: (row) => row.idRecibo.toString(),
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recibos</h1>
          <p className="text-sm text-muted-foreground">Gestiona los recibos de los estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenGenerate(true)} variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Generar Recibos
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="space-y-2">
          <Label htmlFor="periodo" className="text-sm font-semibold">
            Periodo Académico
          </Label>
          <Input
            id="periodo"
            type="number"
            value={idPeriodoAcademico}
            onChange={(e) => setIdPeriodoAcademico(parseInt(e.target.value) || 0)}
            className="text-sm"
            placeholder="ID del periodo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estudiante" className="text-sm font-semibold">
            ID Estudiante (opcional)
          </Label>
          <Input
            id="estudiante"
            type="number"
            value={idEstudiante}
            onChange={(e) => setIdEstudiante(e.target.value)}
            className="text-sm"
            placeholder="Filtrar por estudiante"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estatus" className="text-sm font-semibold">
            Estatus
          </Label>
          <Select value={estatusFilter} onValueChange={setEstatusFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Todos los estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={ReceiptStatus.PENDIENTE.toString()}>Pendiente</SelectItem>
              <SelectItem value={ReceiptStatus.PARCIAL.toString()}>Parcial</SelectItem>
              <SelectItem value={ReceiptStatus.PAGADO.toString()}>Pagado</SelectItem>
              <SelectItem value={ReceiptStatus.VENCIDO.toString()}>Vencido</SelectItem>
              <SelectItem value={ReceiptStatus.CANCELADO.toString()}>Cancelado</SelectItem>
              <SelectItem value={ReceiptStatus.BONIFICADO.toString()}>Bonificado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col justify-end gap-2">
          <Button onClick={loadReceipts} disabled={loading} className="w-full">
            {loading ? "Buscando..." : "Buscar Recibos"}
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
            <X className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {receipts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">Total de Recibos</p>
            <p className="text-2xl font-bold text-blue-900">{totalRecibos}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Monto Total</p>
            <p className="text-2xl font-bold text-green-900">
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(totalMonto)}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700 font-medium">Saldo Pendiente</p>
            <p className="text-2xl font-bold text-orange-900">
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(totalSaldo)}
            </p>
          </div>
        </div>
      )}

      {/* Modales */}
      <GenerateReceiptsModal
        open={openGenerate}
        onOpenChange={setOpenGenerate}
        onSuccess={loadReceipts}
        idPeriodoAcademico={idPeriodoAcademico || undefined}
      />

      <ReceiptDetailsModal open={openDetails} onOpenChange={setOpenDetails} receipt={selectedReceipt} />

      {/* Tabla */}
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando recibos...</div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-destructive">{error}</div>
        </div>
      ) : receipts.length === 0 ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay recibos para el periodo seleccionado</p>
            <p className="text-gray-500 text-sm mt-1">Selecciona un periodo y haz clic en Buscar Recibos</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <DataTable table={table} columns={getReceiptsColumns(handleViewDetails)} />
          </div>
          <DataTablePagination table={table} />
        </>
      )}
    </div>
  );
}
