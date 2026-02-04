"use client";

import { useEffect, useState } from "react";

import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  TrendingUp,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import {
  generarCorteCajaDetallado,
  generarPdfCorteCaja,
  obtenerCajeros,
} from "@/services/payments-service";
import {
  buscarRecibosAvanzado,
  exportarRecibosExcel,
  obtenerEstadisticasRecibos,
  type ReciboBusquedaFiltros,
  type ReciboBusquedaResultado,
  type ReciboEstadisticas,
  type ReciboExtendido,
} from "@/services/receipts-service";
import type { AcademicPeriod } from "@/types/academic-period";
import type {
  PagoDetallado,
  ResumenCorteCajaDetallado,
  UsuarioCajero,
} from "@/types/payment";

interface DeudorAgrupado {
  matricula: string;
  nombreCompleto: string;
  tipoPersona: string;
  email?: string;
  telefono?: string;
  totalRecibos: number;
  recibosVencidos: number;
  recibosPendientes: number;
  totalAdeudo: number;
  totalRecargos: number;
  diasMaxVencido: number;
  recibos: ReciboExtendido[];
}

interface EstadisticasCobranza {
  totalDeudores: number;
  totalAdeudo: number;
  totalRecargos: number;
  recibosVencidos: number;
  recibosPendientes: number;
  promedioDiasVencido: number;
}

interface AntiguedadCartera {
  rango: string;
  cantidad: number;
  monto: number;
  porcentaje: number;
  color: string;
}

interface EstadisticasDashboard {
  totalRecibosEmitidos: number;
  totalRecaudado: number;
  totalPorCobrar: number;
  tasaRecuperacion: number;
  indiceMorosidad: number;

  carteraTotal: number;
  carteraVigente: number;
  carteraVencida: number;

  antiguedadCartera: AntiguedadCartera[];

  recibosPagados: number;
  recibosPendientes: number;
  recibosVencidos: number;
  recibosParciales: number;

  totalRecargos: number;

  promedioMontoPorRecibo: number;
  promedioDiasVencimiento: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [fechaFin, setFechaFin] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [cajeros, setCajeros] = useState<UsuarioCajero[]>([]);
  const [cajeroSeleccionado, setCajeroSeleccionado] = useState<string>("todos");
  const [corteCaja, setCorteCaja] = useState<ResumenCorteCajaDetallado | null>(null);
  const [loadingCajeros, setLoadingCajeros] = useState(false);

  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);
  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("all");
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  const [estatusRecibo, setEstatusRecibo] = useState<string>("all");
  const [reporteRecibos, setReporteRecibos] = useState<ReciboBusquedaResultado | null>(null);
  const [estadisticasRecibos, setEstadisticasRecibos] = useState<ReciboEstadisticas | null>(null);
  const [loadingRecibos, setLoadingRecibos] = useState(false);
  const [paginaRecibos, setPaginaRecibos] = useState(1);

  const [idPeriodoCobranza, setIdPeriodoCobranza] = useState<string>("all");
  const [reporteCobranza, setReporteCobranza] = useState<DeudorAgrupado[] | null>(null);
  const [estadisticasCobranza, setEstadisticasCobranza] = useState<EstadisticasCobranza | null>(null);
  const [loadingCobranza, setLoadingCobranza] = useState(false);

  const [idPeriodoStats, setIdPeriodoStats] = useState<string>("all");
  const [dashboardStats, setDashboardStats] = useState<EstadisticasDashboard | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    cargarCajeros();
    cargarPeriodos();
  }, []);

  const cargarCajeros = async () => {
    setLoadingCajeros(true);
    try {
      const data = await obtenerCajeros();
      setCajeros(data);
    } catch (error) {
      console.error("Error al cargar cajeros:", error);
    } finally {
      setLoadingCajeros(false);
    }
  };

  const cargarPeriodos = async () => {
    setLoadingPeriodos(true);
    try {
      const response = await getAcademicPeriodsList();
      setPeriodos(response.items || []);
      const periodoActual = response.items?.find((p) => p.esPeriodoActual);
      if (periodoActual) {
        setIdPeriodoAcademico(periodoActual.idPeriodoAcademico.toString());
      }
    } catch (error) {
      console.error("Error al cargar periodos:", error);
    } finally {
      setLoadingPeriodos(false);
    }
  };

  const handleGenerarReporteRecibos = async () => {
    setLoadingRecibos(true);
    try {
      const filtros: ReciboBusquedaFiltros = {
        tamanioPagina: 100,
        pagina: paginaRecibos,
      };

      if (idPeriodoAcademico !== "all") {
        filtros.idPeriodoAcademico = parseInt(idPeriodoAcademico);
      }

      if (estatusRecibo !== "all") {
        filtros.estatus = estatusRecibo;
      }

      const [recibosData, estadisticasData] = await Promise.all([
        buscarRecibosAvanzado(filtros),
        obtenerEstadisticasRecibos(idPeriodoAcademico !== "all" ? parseInt(idPeriodoAcademico) : undefined),
      ]);

      setReporteRecibos(recibosData);
      setEstadisticasRecibos(estadisticasData);
      toast.success(`Se encontraron ${recibosData.totalRegistros} recibo(s)`);
    } catch (error) {
      console.error("Error al generar reporte de recibos:", error);
      toast.error("Error al generar el reporte de recibos");
    } finally {
      setLoadingRecibos(false);
    }
  };

  const handleExportarExcelRecibos = async () => {
    if (!reporteRecibos) {
      toast.error("Primero genera el reporte de recibos");
      return;
    }

    setLoadingRecibos(true);
    try {
      const filtros: ReciboBusquedaFiltros = {};

      if (idPeriodoAcademico !== "all") {
        filtros.idPeriodoAcademico = parseInt(idPeriodoAcademico);
      }

      if (estatusRecibo !== "all") {
        filtros.estatus = estatusRecibo;
      }

      const blob = await exportarRecibosExcel(filtros);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const periodoNombre = idPeriodoAcademico !== "all"
        ? periodos.find((p) => p.idPeriodoAcademico.toString() === idPeriodoAcademico)?.nombre?.replace(/\s+/g, "_") || idPeriodoAcademico
        : "TodosLosPeriodos";
      const fechaActual = new Date().toISOString().split("T")[0];
      link.download = `ReporteRecibos_${periodoNombre}_${fechaActual}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Excel descargado exitosamente");
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      toast.error("Error al exportar el archivo Excel");
    } finally {
      setLoadingRecibos(false);
    }
  };

  const handleGenerarReporteCobranza = async () => {
    setLoadingCobranza(true);
    try {
      const filtros: ReciboBusquedaFiltros = {
        tamanioPagina: 1000,
        pagina: 1,
        soloPendientes: true,
      };

      if (idPeriodoCobranza !== "all") {
        filtros.idPeriodoAcademico = parseInt(idPeriodoCobranza);
      }

      const recibosData = await buscarRecibosAvanzado(filtros);

      const deudoresMap = new Map<string, DeudorAgrupado>();

      recibosData.recibos.forEach((recibo) => {
        if (recibo.saldo <= 0) return;

        const key = recibo.matricula || `unknown-${recibo.idEstudiante || recibo.idAspirante}`;

        if (!deudoresMap.has(key)) {
          deudoresMap.set(key, {
            matricula: recibo.matricula || "-",
            nombreCompleto: recibo.nombreCompleto || "-",
            tipoPersona: recibo.tipoPersona,
            email: recibo.email,
            telefono: recibo.telefono,
            totalRecibos: 0,
            recibosVencidos: 0,
            recibosPendientes: 0,
            totalAdeudo: 0,
            totalRecargos: 0,
            diasMaxVencido: 0,
            recibos: [],
          });
        }

        const deudor = deudoresMap.get(key)!;
        deudor.totalRecibos++;
        deudor.totalAdeudo += recibo.saldo;
        deudor.totalRecargos += recibo.recargos;
        deudor.recibos.push(recibo);

        if (recibo.estaVencido) {
          deudor.recibosVencidos++;
          deudor.diasMaxVencido = Math.max(deudor.diasMaxVencido, recibo.diasVencido);
        } else {
          deudor.recibosPendientes++;
        }
      });

      const deudores = Array.from(deudoresMap.values()).sort((a, b) => b.totalAdeudo - a.totalAdeudo);

      const estadisticas: EstadisticasCobranza = {
        totalDeudores: deudores.length,
        totalAdeudo: deudores.reduce((sum, d) => sum + d.totalAdeudo, 0),
        totalRecargos: deudores.reduce((sum, d) => sum + d.totalRecargos, 0),
        recibosVencidos: deudores.reduce((sum, d) => sum + d.recibosVencidos, 0),
        recibosPendientes: deudores.reduce((sum, d) => sum + d.recibosPendientes, 0),
        promedioDiasVencido: deudores.length > 0
          ? Math.round(deudores.reduce((sum, d) => sum + d.diasMaxVencido, 0) / deudores.length)
          : 0,
      };

      setReporteCobranza(deudores);
      setEstadisticasCobranza(estadisticas);
      toast.success(`Se encontraron ${deudores.length} deudor(es)`);
    } catch (error) {
      console.error("Error al generar reporte de cobranza:", error);
      toast.error("Error al generar el reporte de cobranza");
    } finally {
      setLoadingCobranza(false);
    }
  };

  const handleExportarExcelCobranza = async () => {
    if (!reporteCobranza) {
      toast.error("Primero genera el reporte de cobranza");
      return;
    }

    setLoadingCobranza(true);
    try {
      const filtros: ReciboBusquedaFiltros = {
        soloPendientes: true,
      };

      if (idPeriodoCobranza !== "all") {
        filtros.idPeriodoAcademico = parseInt(idPeriodoCobranza);
      }

      const blob = await exportarRecibosExcel(filtros);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const periodoNombre = idPeriodoCobranza !== "all"
        ? periodos.find((p) => p.idPeriodoAcademico.toString() === idPeriodoCobranza)?.nombre?.replace(/\s+/g, "_") || idPeriodoCobranza
        : "TodosLosPeriodos";
      const fechaActual = new Date().toISOString().split("T")[0];
      link.download = `ReporteCobranza_${periodoNombre}_${fechaActual}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Excel de cobranza descargado");
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      toast.error("Error al exportar el archivo Excel");
    } finally {
      setLoadingCobranza(false);
    }
  };

  const handleGenerarEstadisticas = async () => {
    setLoadingStats(true);
    try {
      const filtros: ReciboBusquedaFiltros = {
        tamanioPagina: 5000,
        pagina: 1,
      };

      if (idPeriodoStats !== "all") {
        filtros.idPeriodoAcademico = parseInt(idPeriodoStats);
      }

      const recibosData = await buscarRecibosAvanzado(filtros);
      const recibos = recibosData.recibos;

      const totalRecibosEmitidos = recibos.length;
      const recibosPagados = recibos.filter((r) => r.estatus === "PAGADO").length;
      const recibosPendientes = recibos.filter((r) => r.estatus === "PENDIENTE").length;
      const recibosVencidos = recibos.filter((r) => r.estaVencido).length;
      const recibosParciales = recibos.filter((r) => r.estatus === "PARCIAL").length;

      const totalRecaudado = recibos
        .filter((r) => r.estatus === "PAGADO")
        .reduce((sum, r) => sum + r.total, 0);

      const totalPorCobrar = recibos.reduce((sum, r) => sum + r.saldo, 0);
      const carteraTotal = recibos.reduce((sum, r) => sum + r.total, 0);
      const carteraVigente = recibos
        .filter((r) => !r.estaVencido && r.saldo > 0)
        .reduce((sum, r) => sum + r.saldo, 0);
      const carteraVencida = recibos
        .filter((r) => r.estaVencido)
        .reduce((sum, r) => sum + r.saldo, 0);

      const tasaRecuperacion = carteraTotal > 0 ? (totalRecaudado / carteraTotal) * 100 : 0;
      const indiceMorosidad = carteraTotal > 0 ? (carteraVencida / carteraTotal) * 100 : 0;

      const totalRecargos = recibos.reduce((sum, r) => sum + r.recargos, 0);
      const promedioMontoPorRecibo = totalRecibosEmitidos > 0
        ? carteraTotal / totalRecibosEmitidos
        : 0;

      const recibosConVencimiento = recibos.filter((r) => r.diasVencido > 0);
      const promedioDiasVencimiento = recibosConVencimiento.length > 0
        ? recibosConVencimiento.reduce((sum, r) => sum + r.diasVencido, 0) / recibosConVencimiento.length
        : 0;

      const rangosAntiguedad = [
        { min: 0, max: 0, label: "Vigente", color: "bg-green-500" },
        { min: 1, max: 30, label: "1-30 días", color: "bg-yellow-500" },
        { min: 31, max: 60, label: "31-60 días", color: "bg-orange-500" },
        { min: 61, max: 90, label: "61-90 días", color: "bg-red-400" },
        { min: 91, max: 9999, label: "+90 días", color: "bg-red-600" },
      ];

      const antiguedadCartera: AntiguedadCartera[] = rangosAntiguedad.map((rango) => {
        const recibosEnRango = recibos.filter((r) => {
          if (rango.min === 0 && rango.max === 0) {
            return !r.estaVencido && r.saldo > 0;
          }
          return r.diasVencido >= rango.min && r.diasVencido <= rango.max && r.saldo > 0;
        });

        const monto = recibosEnRango.reduce((sum, r) => sum + r.saldo, 0);

        return {
          rango: rango.label,
          cantidad: recibosEnRango.length,
          monto,
          porcentaje: totalPorCobrar > 0 ? (monto / totalPorCobrar) * 100 : 0,
          color: rango.color,
        };
      });

      setDashboardStats({
        totalRecibosEmitidos,
        totalRecaudado,
        totalPorCobrar,
        tasaRecuperacion,
        indiceMorosidad,
        carteraTotal,
        carteraVigente,
        carteraVencida,
        antiguedadCartera,
        recibosPagados,
        recibosPendientes,
        recibosVencidos,
        recibosParciales,
        totalRecargos,
        promedioMontoPorRecibo,
        promedioDiasVencimiento: Math.round(promedioDiasVencimiento),
      });

      toast.success("Estadísticas generadas correctamente");
    } catch (error) {
      console.error("Error al generar estadísticas:", error);
      toast.error("Error al generar las estadísticas");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleGenerarCorteCaja = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Selecciona un rango de fechas");
      return;
    }

    setLoading(true);
    try {
      const data = await generarCorteCajaDetallado({
        fechaInicio: `${fechaInicio}T00:00:00`,
        fechaFin: `${fechaFin}T23:59:59`,
        idUsuarioCaja: cajeroSeleccionado !== "todos" ? cajeroSeleccionado : undefined,
      });
      setCorteCaja(data);
      toast.success(`Se encontraron ${data.totales.cantidad} pago(s)`);
    } catch (error) {
      console.error("Error al generar corte:", error);
      toast.error("Error al generar el corte de caja");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Selecciona un rango de fechas");
      return;
    }

    setLoading(true);
    try {
      const blob = await generarPdfCorteCaja({
        fechaInicio: `${fechaInicio}T00:00:00`,
        fechaFin: `${fechaFin}T23:59:59`,
        idUsuarioCaja: cajeroSeleccionado !== "todos" ? cajeroSeleccionado : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CorteCaja_${fechaInicio}_${fechaFin}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al exportar el PDF");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMedioPagoBadge = (medioPago?: string) => {
    const medio = medioPago?.toLowerCase() || "";
    if (medio.includes("efectivo")) {
      return <Badge className="bg-green-100 text-green-800">Efectivo</Badge>;
    }
    if (medio.includes("transferencia")) {
      return <Badge className="bg-blue-100 text-blue-800">Transferencia</Badge>;
    }
    if (medio.includes("tarjeta")) {
      return <Badge className="bg-purple-100 text-purple-800">Tarjeta</Badge>;
    }
    return <Badge variant="outline">{medioPago || "N/A"}</Badge>;
  };

  const getEstatusReciboBadge = (estatus: string, estaVencido: boolean) => {
    const estatusLower = estatus.toLowerCase();
    if (estatusLower === "pagado") {
      return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
    }
    if (estatusLower === "parcial") {
      return <Badge className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
    }
    if (estatusLower === "cancelado") {
      return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
    }
    if (estaVencido || estatusLower === "vencido") {
      return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes Financieros</h1>
          <p className="text-sm text-muted-foreground">Genera reportes de pagos, recibos y estadísticas</p>
        </div>
      </div>

      <Tabs defaultValue="corte-caja" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="corte-caja">Corte de Caja</TabsTrigger>
          <TabsTrigger value="recibos">Recibos</TabsTrigger>
          <TabsTrigger value="cobranza">Cobranza</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="corte-caja" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Corte de Caja
              </CardTitle>
              <CardDescription>Reporte de pagos recibidos en un periodo específico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cajero">Cajero</Label>
                  <Select value={cajeroSeleccionado} onValueChange={setCajeroSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cajero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los cajeros</SelectItem>
                      {cajeros.map((cajero) => (
                        <SelectItem key={cajero.idUsuario} value={cajero.idUsuario}>
                          {cajero.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerarCorteCaja} disabled={loading} className="flex-1">
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Generando..." : "Generar Reporte"}
                </Button>
                <Button variant="outline" disabled={loading || !corteCaja} onClick={handleExportarPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {corteCaja && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Total Pagos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{corteCaja.totales.cantidad}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Monto Total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(corteCaja.totales.total)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Efectivo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(corteCaja.totales.efectivo)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Transferencia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(corteCaja.totales.transferencia)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Tarjeta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(corteCaja.totales.tarjeta)}</p>
                  </CardContent>
                </Card>
              </div>

              {corteCaja.cajero && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Cajero: {corteCaja.cajero.nombreCompleto}</p>
                        <p className="text-sm text-blue-700">{corteCaja.cajero.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Detalle de Pagos</CardTitle>
                  <CardDescription>
                    Periodo: {new Date(fechaInicio).toLocaleDateString("es-MX")} -{" "}
                    {new Date(fechaFin).toLocaleDateString("es-MX")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">Folio</TableHead>
                          <TableHead className="font-semibold">Fecha/Hora</TableHead>
                          <TableHead className="font-semibold">Estudiante</TableHead>
                          <TableHead className="font-semibold">Concepto</TableHead>
                          <TableHead className="font-semibold">Medio</TableHead>
                          <TableHead className="text-right font-semibold">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {corteCaja.pagos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No se encontraron pagos en el periodo seleccionado
                            </TableCell>
                          </TableRow>
                        ) : (
                          corteCaja.pagos.map((pago: PagoDetallado) => (
                            <TableRow key={pago.idPago}>
                              <TableCell className="font-mono text-sm">
                                {pago.folioPago || `#${pago.idPago}`}
                              </TableCell>
                              <TableCell className="text-sm">{formatDateTime(pago.fechaPagoUtc)}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{pago.nombreEstudiante || "-"}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{pago.matricula || "-"}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{pago.concepto || "-"}</p>
                                  {pago.folioRecibo && (
                                    <p className="text-xs text-muted-foreground font-mono">{pago.folioRecibo}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getMedioPagoBadge(pago.medioPago)}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(pago.monto)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!corteCaja && (
            <div className="p-8 text-center border rounded-lg bg-slate-50">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona un rango de fechas y haz clic en &quot;Generar Reporte&quot; para ver el corte de caja
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recibos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reporte de Recibos
              </CardTitle>
              <CardDescription>Estado de recibos por periodo académico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Periodo Académico</Label>
                  <Select value={idPeriodoAcademico} onValueChange={setIdPeriodoAcademico}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los periodos</SelectItem>
                      {periodos.map((periodo) => (
                        <SelectItem key={periodo.idPeriodoAcademico} value={periodo.idPeriodoAcademico.toString()}>
                          {periodo.nombre} {periodo.esPeriodoActual && "(Actual)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estatus">Estatus</Label>
                  <Select value={estatusRecibo} onValueChange={setEstatusRecibo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estatus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                      <SelectItem value="PARCIAL">Parcial</SelectItem>
                      <SelectItem value="PAGADO">Pagado</SelectItem>
                      <SelectItem value="VENCIDO">Vencido</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerarReporteRecibos} disabled={loadingRecibos} className="flex-1">
                  {loadingRecibos ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {loadingRecibos ? "Generando..." : "Generar Reporte"}
                </Button>
                <Button variant="outline" disabled={loadingRecibos || !reporteRecibos} onClick={handleExportarExcelRecibos}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {estadisticasRecibos && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Total Recibos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{estadisticasRecibos.totalRecibos}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Pagados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{estadisticasRecibos.recibosPagados}</p>
                  <p className="text-sm text-muted-foreground">
                    Cobrado: {formatCurrency(estadisticasRecibos.totalCobrado)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    Pendientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">
                    {estadisticasRecibos.recibosPendientes + estadisticasRecibos.recibosParciales}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saldo: {formatCurrency(estadisticasRecibos.saldoPendiente)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Vencidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{estadisticasRecibos.recibosVencidos}</p>
                  <p className="text-sm text-muted-foreground">
                    Recargos: {formatCurrency(estadisticasRecibos.recargosAcumulados)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {reporteRecibos && (
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Recibos</CardTitle>
                <CardDescription>
                  Mostrando {reporteRecibos.recibos.length} de {reporteRecibos.totalRegistros} recibos
                  {reporteRecibos.totalPaginas > 1 && ` (Página ${reporteRecibos.paginaActual} de ${reporteRecibos.totalPaginas})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Folio</TableHead>
                        <TableHead className="font-semibold">Estudiante</TableHead>
                        <TableHead className="font-semibold">Periodo</TableHead>
                        <TableHead className="font-semibold">Vencimiento</TableHead>
                        <TableHead className="font-semibold">Estatus</TableHead>
                        <TableHead className="text-right font-semibold">Total</TableHead>
                        <TableHead className="text-right font-semibold">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporteRecibos.recibos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No se encontraron recibos con los filtros seleccionados
                          </TableCell>
                        </TableRow>
                      ) : (
                        reporteRecibos.recibos.map((recibo: ReciboExtendido) => (
                          <TableRow key={recibo.idRecibo}>
                            <TableCell className="font-mono text-sm">
                              {recibo.folio || `#${recibo.idRecibo}`}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{recibo.nombreCompleto || "-"}</p>
                                <p className="text-xs text-muted-foreground font-mono">{recibo.matricula || "-"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{recibo.nombrePeriodo || "-"}</TableCell>
                            <TableCell className="text-sm">
                              <div>
                                {formatDate(recibo.fechaVencimiento)}
                                {recibo.diasVencido > 0 && (
                                  <p className="text-xs text-red-600">{recibo.diasVencido} días vencido</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getEstatusReciboBadge(recibo.estatus, recibo.estaVencido)}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(recibo.total)}
                              {recibo.recargos > 0 && (
                                <p className="text-xs text-red-600">+{formatCurrency(recibo.recargos)} recargo</p>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={recibo.saldo > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                                {formatCurrency(recibo.saldo)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {reporteRecibos.totalPaginas > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Total: {reporteRecibos.totalRegistros} recibos
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginaRecibos <= 1 || loadingRecibos}
                        onClick={() => {
                          setPaginaRecibos((p) => p - 1);
                          handleGenerarReporteRecibos();
                        }}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginaRecibos >= reporteRecibos.totalPaginas || loadingRecibos}
                        onClick={() => {
                          setPaginaRecibos((p) => p + 1);
                          handleGenerarReporteRecibos();
                        }}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(reporteRecibos.totalSaldoPendiente)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Recargos</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(reporteRecibos.totalRecargos)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recibos Vencidos</p>
                      <p className="text-lg font-bold text-red-600">{reporteRecibos.totalVencidos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recibos Pagados</p>
                      <p className="text-lg font-bold text-green-600">{reporteRecibos.totalPagados}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!reporteRecibos && !loadingRecibos && (
            <div className="p-8 text-center border rounded-lg bg-slate-50">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona un periodo académico y haz clic en &quot;Generar Reporte&quot; para ver los recibos
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cobranza" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Reporte de Cobranza
              </CardTitle>
              <CardDescription>Análisis de cuentas por cobrar y morosidad por estudiante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="periodo-cobranza">Periodo Académico</Label>
                <Select value={idPeriodoCobranza} onValueChange={setIdPeriodoCobranza}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los periodos</SelectItem>
                    {periodos.map((periodo) => (
                      <SelectItem key={periodo.idPeriodoAcademico} value={periodo.idPeriodoAcademico.toString()}>
                        {periodo.nombre} {periodo.esPeriodoActual && "(Actual)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerarReporteCobranza} disabled={loadingCobranza} className="flex-1">
                  {loadingCobranza ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  {loadingCobranza ? "Generando..." : "Generar Reporte"}
                </Button>
                <Button variant="outline" disabled={loadingCobranza || !reporteCobranza} onClick={handleExportarExcelCobranza}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas de cobranza */}
          {estadisticasCobranza && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Deudores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{estadisticasCobranza.totalDeudores}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    Total Adeudo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(estadisticasCobranza.totalAdeudo)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    Recargos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(estadisticasCobranza.totalRecargos)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Vencidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{estadisticasCobranza.recibosVencidos}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    Pendientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">{estadisticasCobranza.recibosPendientes}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Prom. Días Venc.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{estadisticasCobranza.promedioDiasVencido}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {reporteCobranza && (
            <Card>
              <CardHeader>
                <CardTitle>Detalle por Deudor</CardTitle>
                <CardDescription>
                  {reporteCobranza.length} estudiante(s)/aspirante(s) con adeudos pendientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Estudiante</TableHead>
                        <TableHead className="font-semibold">Tipo</TableHead>
                        <TableHead className="font-semibold text-center">Recibos</TableHead>
                        <TableHead className="font-semibold text-center">Vencidos</TableHead>
                        <TableHead className="font-semibold text-center">Días Venc.</TableHead>
                        <TableHead className="text-right font-semibold">Recargos</TableHead>
                        <TableHead className="text-right font-semibold">Total Adeudo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporteCobranza.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            No hay deudores pendientes en el periodo seleccionado
                          </TableCell>
                        </TableRow>
                      ) : (
                        reporteCobranza.map((deudor) => (
                          <TableRow key={deudor.matricula} className="hover:bg-slate-50">
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{deudor.nombreCompleto}</p>
                                <p className="text-xs text-muted-foreground font-mono">{deudor.matricula}</p>
                                {deudor.telefono && (
                                  <p className="text-xs text-muted-foreground">{deudor.telefono}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={deudor.tipoPersona === "Estudiante" ? "default" : "secondary"}>
                                {deudor.tipoPersona}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{deudor.totalRecibos}</TableCell>
                            <TableCell className="text-center">
                              {deudor.recibosVencidos > 0 ? (
                                <Badge variant="destructive">{deudor.recibosVencidos}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {deudor.diasMaxVencido > 0 ? (
                                <span className="text-red-600 font-semibold">{deudor.diasMaxVencido}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {deudor.totalRecargos > 0 ? (
                                <span className="text-orange-600">{formatCurrency(deudor.totalRecargos)}</span>
                              ) : (
                                <span className="text-muted-foreground">$0.00</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-red-600 font-bold">{formatCurrency(deudor.totalAdeudo)}</span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {reporteCobranza.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Deudores</p>
                        <p className="text-lg font-bold">{reporteCobranza.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recibos Pendientes</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {reporteCobranza.reduce((sum, d) => sum + d.totalRecibos, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Recargos</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(reporteCobranza.reduce((sum, d) => sum + d.totalRecargos, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total por Cobrar</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(reporteCobranza.reduce((sum, d) => sum + d.totalAdeudo, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!reporteCobranza && !loadingCobranza && (
            <div className="p-8 text-center border rounded-lg bg-slate-50">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona un periodo académico y haz clic en &quot;Generar Reporte&quot; para ver el análisis de cobranza
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard Financiero
              </CardTitle>
              <CardDescription>Métricas, morosidad y análisis de cartera</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="periodo-stats">Periodo Académico</Label>
                <Select value={idPeriodoStats} onValueChange={setIdPeriodoStats}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los periodos</SelectItem>
                    {periodos.map((periodo) => (
                      <SelectItem key={periodo.idPeriodoAcademico} value={periodo.idPeriodoAcademico.toString()}>
                        {periodo.nombre} {periodo.esPeriodoActual && "(Actual)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerarEstadisticas} disabled={loadingStats} className="w-full">
                {loadingStats ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-2" />
                )}
                {loadingStats ? "Generando..." : "Ver Estadísticas"}
              </Button>
            </CardContent>
          </Card>

          {/* Dashboard de estadísticas */}
          {dashboardStats && (
            <>
              {/* KPIs Principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardDescription>Recibos Emitidos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{dashboardStats.totalRecibosEmitidos}</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardDescription>Total Recaudado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboardStats.totalRecaudado)}</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <CardDescription>Por Cobrar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(dashboardStats.totalPorCobrar)}</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <CardDescription>Recargos Generados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(dashboardStats.totalRecargos)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Tasa de Recuperación
                    </CardTitle>
                    <CardDescription>Porcentaje de cartera cobrada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${Math.min(dashboardStats.tasaRecuperacion, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {dashboardStats.tasaRecuperacion.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(dashboardStats.totalRecaudado)} de {formatCurrency(dashboardStats.carteraTotal)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Índice de Morosidad
                    </CardTitle>
                    <CardDescription>Porcentaje de cartera vencida</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all"
                            style={{ width: `${Math.min(dashboardStats.indiceMorosidad, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-red-600">
                        {dashboardStats.indiceMorosidad.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(dashboardStats.carteraVencida)} de {formatCurrency(dashboardStats.carteraTotal)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Antigüedad de Cartera
                  </CardTitle>
                  <CardDescription>Distribución de adeudos por días de vencimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardStats.antiguedadCartera.map((rango) => (
                      <div key={rango.rango} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">{rango.rango}</div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-100 rounded overflow-hidden">
                            <div
                              className={`h-full ${rango.color} transition-all flex items-center justify-end pr-2`}
                              style={{ width: `${Math.max(rango.porcentaje, rango.cantidad > 0 ? 5 : 0)}%` }}
                            >
                              {rango.porcentaje >= 10 && (
                                <span className="text-xs text-white font-medium">{rango.porcentaje.toFixed(0)}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm text-muted-foreground">{rango.cantidad} rec.</div>
                        <div className="w-28 text-right font-semibold">{formatCurrency(rango.monto)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="font-medium">Total Cartera Pendiente:</span>
                    <span className="text-xl font-bold text-red-600">{formatCurrency(dashboardStats.totalPorCobrar)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribución de Recibos</CardTitle>
                    <CardDescription>Por estatus de pago</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Pagados</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="bg-green-600">{dashboardStats.recibosPagados}</Badge>
                          <span className="text-sm text-muted-foreground">
                            ({((dashboardStats.recibosPagados / dashboardStats.totalRecibosEmitidos) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span>Pendientes</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-yellow-500 text-white">{dashboardStats.recibosPendientes}</Badge>
                          <span className="text-sm text-muted-foreground">
                            ({((dashboardStats.recibosPendientes / dashboardStats.totalRecibosEmitidos) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-orange-600" />
                          <span>Parciales</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-orange-500 text-white">{dashboardStats.recibosParciales}</Badge>
                          <span className="text-sm text-muted-foreground">
                            ({((dashboardStats.recibosParciales / dashboardStats.totalRecibosEmitidos) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span>Vencidos</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive">{dashboardStats.recibosVencidos}</Badge>
                          <span className="text-sm text-muted-foreground">
                            ({((dashboardStats.recibosVencidos / dashboardStats.totalRecibosEmitidos) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Indicadores Clave</CardTitle>
                    <CardDescription>Métricas de rendimiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Promedio por Recibo</p>
                          <p className="text-xl font-bold">{formatCurrency(dashboardStats.promedioMontoPorRecibo)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Prom. Días Vencimiento</p>
                          <p className="text-xl font-bold">{dashboardStats.promedioDiasVencimiento} días</p>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Cartera Vigente</p>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(dashboardStats.carteraVigente)}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Cartera Vencida</p>
                          <p className="text-xl font-bold text-red-600">{formatCurrency(dashboardStats.carteraVencida)}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {!dashboardStats && !loadingStats && (
            <div className="p-8 text-center border rounded-lg bg-slate-50">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona un periodo académico y haz clic en &quot;Ver Estadísticas&quot; para generar el dashboard
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los reportes se generan en tiempo real basados en la información de la base de datos.
          Para reportes históricos, asegúrate de seleccionar el periodo académico correcto.
        </p>
      </div>
    </div>
  );
}
