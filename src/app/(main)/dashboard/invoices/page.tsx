"use client";

import { useCallback, useEffect, useState } from "react";

import { Ban, FileText, Plus, RotateCcw, X, Search, Download, Filter } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getAcademicPeriods } from "@/services/catalogs-service";
import {
  buscarRecibosAvanzado,
  ReciboExtendido,
  ReciboBusquedaFiltros,
  ReciboBusquedaResultado,
  exportarRecibosExcel,
  cancelarRecibo,
  reversarRecibo,
} from "@/services/receipts-service";
import { AcademicPeriod } from "@/types/catalog";

import { getReceiptsColumns } from "./_components/columns";
import { GenerateReceiptsModal } from "./_components/generate-receipts-modal";
import { ReceiptDetailsModal } from "./_components/receipt-details-modal";

export default function InvoicesPage() {
  const [openGenerate, setOpenGenerate] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReciboExtendido | null>(null);

  const [confirmCancelar, setConfirmCancelar] = useState<ReciboExtendido | null>(null);
  const [motivoCancelar, setMotivoCancelar] = useState("");
  const [confirmReversar, setConfirmReversar] = useState<ReciboExtendido | null>(null);
  const [motivoReversar, setMotivoReversar] = useState("");
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const [receipts, setReceipts] = useState<ReciboExtendido[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);
  const [resultado, setResultado] = useState<ReciboBusquedaResultado | null>(null);

  const [filtros, setFiltros] = useState<ReciboBusquedaFiltros>({
    idPeriodoAcademico: undefined,
    matricula: "",
    folio: "",
    estatus: "",
    soloVencidos: false,
    soloPendientes: false,
    soloPagados: false,
    pagina: 1,
    tamanioPagina: 50,
  });

  useEffect(() => {
    const loadPeriodos = async () => {
      try {
        const data = await getAcademicPeriods();
        setPeriodos(data);
        const periodoActual = data.find((p) => p.esPeriodoActual);
        if (periodoActual) {
          setFiltros((prev) => ({ ...prev, idPeriodoAcademico: periodoActual.idPeriodoAcademico }));
        }
      } catch (err) {
        console.error("Error al cargar periodos:", err);
        toast.error("Error al cargar periodos académicos");
      } finally {
        setLoadingPeriodos(false);
      }
    };
    loadPeriodos();
  }, []);

  const loadReceipts = useCallback(async () => {
    setLoading(true);

    try {
      const filtrosLimpios: ReciboBusquedaFiltros = {
        ...filtros,
        matricula: filtros.matricula?.trim() || undefined,
        folio: filtros.folio?.trim() || undefined,
        estatus: filtros.estatus === "all" || !filtros.estatus ? undefined : filtros.estatus,
      };

      const data = await buscarRecibosAvanzado(filtrosLimpios);
      setReceipts(data.recibos);
      setResultado(data);
    } catch (err) {
      console.error("Error al cargar recibos:", err);
      toast.error("Error al cargar los recibos");
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      loadReceipts();
    }
  };

  const handleViewDetails = (receipt: ReciboExtendido) => {
    setSelectedReceipt(receipt);
    setOpenDetails(true);
  };

  const handleCancelar = (receipt: ReciboExtendido) => {
    setConfirmCancelar(receipt);
    setMotivoCancelar("");
  };

  const handleReversar = (receipt: ReciboExtendido) => {
    setConfirmReversar(receipt);
    setMotivoReversar("");
  };

  const handleConfirmCancelar = async () => {
    if (!confirmCancelar || !motivoCancelar.trim()) {
      toast.error("Debe proporcionar un motivo para cancelar");
      return;
    }
    setProcesandoAccion(true);
    try {
      await cancelarRecibo(confirmCancelar.idRecibo, motivoCancelar);
      toast.success(`Recibo ${confirmCancelar.folio} cancelado exitosamente`);
      setConfirmCancelar(null);
      setMotivoCancelar("");
      loadReceipts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error al cancelar el recibo");
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleConfirmReversar = async () => {
    if (!confirmReversar || !motivoReversar.trim()) {
      toast.error("Debe proporcionar un motivo para reversar");
      return;
    }
    setProcesandoAccion(true);
    try {
      await reversarRecibo(confirmReversar.idRecibo, motivoReversar);
      toast.success(`Recibo ${confirmReversar.folio} reversado exitosamente`);
      setConfirmReversar(null);
      setMotivoReversar("");
      loadReceipts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error al reversar el recibo");
    } finally {
      setProcesandoAccion(false);
    }
  };

  const clearFilters = () => {
    const periodoActual = periodos.find((p) => p.esPeriodoActual);
    setFiltros({
      idPeriodoAcademico: periodoActual?.idPeriodoAcademico,
      matricula: "",
      folio: "",
      estatus: "",
      soloVencidos: false,
      soloPendientes: false,
      soloPagados: false,
      pagina: 1,
      tamanioPagina: 50,
    });
    setReceipts([]);
    setResultado(null);
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportarRecibosExcel(filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recibos_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Archivo exportado exitosamente");
    } catch {
      toast.error("Error al exportar");
    }
  };

  const table = useDataTableInstance({
    data: receipts,
    columns: getReceiptsColumns(handleViewDetails, handleCancelar, handleReversar),
    getRowId: (row) => row.idRecibo.toString(),
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recibos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los recibos de los estudiantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenGenerate(true)} variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Generar Recibos
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label className="text-sm font-semibold truncate">Periodo</Label>
              {loadingPeriodos ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={filtros.idPeriodoAcademico?.toString() || "all"}
                  onValueChange={(value) =>
                    setFiltros((prev) => ({
                      ...prev,
                      idPeriodoAcademico: value === "all" ? undefined : parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los periodos</SelectItem>
                    {periodos.map((p) => (
                      <SelectItem key={p.idPeriodoAcademico} value={p.idPeriodoAcademico.toString()}>
                        <span className="truncate">
                          {p.clave} - {p.nombre} {p.esPeriodoActual && "(Actual)"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Estatus</Label>
              <Select
                value={filtros.estatus || "all"}
                onValueChange={(value) =>
                  setFiltros((prev) => ({ ...prev, estatus: value === "all" ? "" : value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Parcial">Parcial</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Bonificado">Bonificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Matrícula</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por matrícula..."
                  value={filtros.matricula || ""}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, matricula: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Folio</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por folio..."
                  value={filtros.folio || ""}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, folio: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id="soloVencidos"
                  checked={filtros.soloVencidos}
                  onCheckedChange={(checked) =>
                    setFiltros((prev) => ({ ...prev, soloVencidos: !!checked }))
                  }
                />
                <span className="text-sm">Vencidos</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id="soloPendientes"
                  checked={filtros.soloPendientes}
                  onCheckedChange={(checked) =>
                    setFiltros((prev) => ({ ...prev, soloPendientes: !!checked }))
                  }
                />
                <span className="text-sm">Pendientes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id="soloPagados"
                  checked={filtros.soloPagados}
                  onCheckedChange={(checked) =>
                    setFiltros((prev) => ({ ...prev, soloPagados: !!checked }))
                  }
                />
                <span className="text-sm">Pagados</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={clearFilters} variant="outline" size="sm">
                <X className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Limpiar</span>
              </Button>
              <Button onClick={handleExportExcel} variant="outline" size="sm" disabled={receipts.length === 0}>
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button onClick={loadReceipts} disabled={loading} size="sm">
                <Filter className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{loading ? "Buscando..." : "Buscar"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {resultado && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-blue-700 font-medium">Total Recibos</p>
              <p className="text-2xl font-bold text-blue-900">{resultado.totalRegistros}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-green-700 font-medium">Pagados</p>
              <p className="text-2xl font-bold text-green-900">{resultado.totalPagados}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-yellow-700 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{resultado.totalPendientes}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-red-700 font-medium">Vencidos</p>
              <p className="text-2xl font-bold text-red-900">{resultado.totalVencidos}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-orange-700 font-medium">Saldo Pendiente</p>
              <p className="text-xl font-bold text-orange-900">
                {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
                  resultado.totalSaldoPendiente
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <GenerateReceiptsModal
        open={openGenerate}
        onOpenChange={setOpenGenerate}
        onSuccess={loadReceipts}
        idPeriodoAcademico={filtros.idPeriodoAcademico || undefined}
      />

      <ReceiptDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        receipt={selectedReceipt as any}
      />
      <AlertDialog open={confirmCancelar !== null} onOpenChange={(open) => !open && setConfirmCancelar(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <Ban className="h-5 w-5" />
              Cancelar Recibo
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-gray-700">
                  ¿Está seguro que desea cancelar el recibo <strong>{confirmCancelar?.folio}</strong>?
                </p>
                <div className="space-y-2">
                  <Label htmlFor="motivoCancelar" className="text-gray-900">Motivo de la cancelación *</Label>
                  <Input
                    id="motivoCancelar"
                    placeholder="Ej: Error en la generación del recibo"
                    value={motivoCancelar}
                    onChange={(e) => setMotivoCancelar(e.target.value)}
                  />
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-800">
                    Esta acción marcará el recibo como CANCELADO. Solo se puede cancelar si no tiene pagos aplicados.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={procesandoAccion}>Cerrar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelar}
              disabled={!motivoCancelar.trim() || procesandoAccion}
              className="bg-red-600 hover:bg-red-700"
            >
              {procesandoAccion ? "Cancelando..." : "Cancelar Recibo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReversar !== null} onOpenChange={(open) => !open && setConfirmReversar(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-700">
              <RotateCcw className="h-5 w-5" />
              Reversar Recibo
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-gray-700">
                  ¿Está seguro que desea reversar el recibo <strong>{confirmReversar?.folio}</strong>?
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-orange-800">
                    <span className="font-medium">Estado actual:</span> {confirmReversar?.estatus}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivoReversar" className="text-gray-900">Motivo de la reversión *</Label>
                  <Input
                    id="motivoReversar"
                    placeholder="Ej: Pago duplicado, error de captura"
                    value={motivoReversar}
                    onChange={(e) => setMotivoReversar(e.target.value)}
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    Esta acción eliminará los pagos aplicados y regresará el recibo a estado PENDIENTE.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={procesandoAccion}>Cerrar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReversar}
              disabled={!motivoReversar.trim() || procesandoAccion}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {procesandoAccion ? "Reversando..." : "Reversar Recibo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-muted-foreground">Cargando recibos...</div>
        </div>
      ) : receipts.length === 0 ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay recibos para mostrar</p>
            <p className="text-gray-500 text-sm mt-1">
              Usa los filtros y haz clic en &quot;Buscar&quot; para ver los recibos
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <DataTable table={table} columns={getReceiptsColumns(handleViewDetails, handleCancelar, handleReversar)} />
          </div>
          <DataTablePagination table={table} />
        </>
      )}
    </div>
  );
}
