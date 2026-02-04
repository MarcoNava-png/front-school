"use client";

import { Fragment, useEffect, useState } from "react";

import { Ban, Check, ChevronDown, ChevronRight, DollarSign, Edit2, FileText, Printer, RotateCcw, Search, Trash2, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  calcularDiasVencido,
  calcularRecargo,
  calcularTotalAPagarHoy,
  descargarComprobantePDF,
  formatCurrency,
  formatReceiptStatus,
  getReceiptStatusVariant,
  isPaidOrPartial,
  isCanceledOrPaid,
} from "@/lib/payment-utils";
import { buscarRecibosParaCobro, buscarTodosLosRecibos, descargarComprobantePago, imprimirReciboPdf, modificarDetalleRecibo, modificarRecargoRecibo, obtenerMediosPago, quitarRecargoRecibo, registrarPagoCaja } from "@/services/payments-service";
import { cancelarRecibo, reversarRecibo } from "@/services/receipts-service";
import type { MedioPago, RecibosParaCobro } from "@/types/payment";
import type { Receipt } from "@/types/receipt";

export default function CashierPage() {
  const [criterio, setCriterio] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const [resultado, setResultado] = useState<RecibosParaCobro | null>(null);

  const [recibosSeleccionados, setRecibosSeleccionados] = useState<Set<number>>(new Set());

  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [medioPago, setMedioPago] = useState<number>(1);
  const [monto, setMonto] = useState<string>("");
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");

  const [procesando, setProcesando] = useState(false);

  const [recibosExpandidos, setRecibosExpandidos] = useState<Set<number>>(new Set());

  const [editingDetail, setEditingDetail] = useState<{
    idRecibo: number;
    idReciboDetalle: number;
    descripcion: string;
    montoActual: number;
  } | null>(null);
  const [nuevoMontoDetalle, setNuevoMontoDetalle] = useState<string>("");
  const [motivoDetalle, setMotivoDetalle] = useState<string>("");
  const [guardandoDetalle, setGuardandoDetalle] = useState(false);

  const [editingRecargo, setEditingRecargo] = useState<{
    idRecibo: number;
    folio: string;
    recargoActual: number;
  } | null>(null);
  const [nuevoRecargo, setNuevoRecargo] = useState<string>("");
  const [motivoRecargo, setMotivoRecargo] = useState<string>("");
  const [guardandoRecargo, setGuardandoRecargo] = useState(false);

  const [confirmQuitarRecargo, setConfirmQuitarRecargo] = useState<{
    idRecibo: number;
    folio: string;
  } | null>(null);
  const [motivoQuitarRecargo, setMotivoQuitarRecargo] = useState<string>("");

  const [confirmCancelar, setConfirmCancelar] = useState<{ idRecibo: number; folio: string } | null>(null);
  const [motivoCancelar, setMotivoCancelar] = useState<string>("");
  const [confirmReversar, setConfirmReversar] = useState<{ idRecibo: number; folio: string; estatus: string } | null>(null);
  const [motivoReversar, setMotivoReversar] = useState<string>("");
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  useEffect(() => {
    cargarMediosPago();
  }, []);

  async function cargarMediosPago() {
    try {
      const medios = await obtenerMediosPago();
      setMediosPago(medios);
    } catch (error) {
      console.error("Error al cargar medios de pago:", error);
    }
  }

  async function buscar() {
    if (!criterio.trim()) {
      toast.error("Ingresa una matrícula, nombre o folio de recibo");
      return;
    }

    setBuscando(true);
    try {
      const data = mostrarTodos
        ? await buscarTodosLosRecibos(criterio.trim())
        : await buscarRecibosParaCobro(criterio.trim());

      if (data.multiple && data.estudiantes) {
        toast.error("Se encontraron múltiples estudiantes. Sé más específico en la búsqueda.");
        setResultado(null);
      } else if (data.recibos.length === 0) {
        toast.info(mostrarTodos ? "No se encontraron recibos" : "No se encontraron recibos pendientes");
        setResultado(null);
      } else {
        setResultado(data);
        setRecibosSeleccionados(new Set());
        toast.success(`Se encontraron ${data.recibos.length} recibo(s)`);
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "No se encontró el estudiante o recibo");
      setResultado(null);
    } finally {
      setBuscando(false);
    }
  }

  function toggleRecibo(idRecibo: number) {
    const newSet = new Set(recibosSeleccionados);
    if (newSet.has(idRecibo)) {
      newSet.delete(idRecibo);
    } else {
      newSet.add(idRecibo);
    }
    setRecibosSeleccionados(newSet);
  }

  function toggleTodos() {
    if (recibosSeleccionados.size === resultado?.recibos.length) {
      setRecibosSeleccionados(new Set());
    } else {
      const todosIds = new Set(resultado?.recibos.map((r) => r.idRecibo));
      setRecibosSeleccionados(todosIds);
    }
  }

  function toggleExpandido(idRecibo: number) {
    const newSet = new Set(recibosExpandidos);
    if (newSet.has(idRecibo)) {
      newSet.delete(idRecibo);
    } else {
      newSet.add(idRecibo);
    }
    setRecibosExpandidos(newSet);
  }

  function expandirTodos() {
    if (recibosExpandidos.size === resultado?.recibos.length) {
      setRecibosExpandidos(new Set());
    } else {
      const todosIds = new Set(resultado?.recibos.map((r) => r.idRecibo));
      setRecibosExpandidos(todosIds);
    }
  }

  function handleOpenQuitarRecargo(idRecibo: number, folio: string) {
    setConfirmQuitarRecargo({ idRecibo, folio });
    setMotivoQuitarRecargo("");
  }

  async function handleConfirmQuitarRecargo() {
    if (!confirmQuitarRecargo) return;

    if (!motivoQuitarRecargo.trim()) {
      toast.error("Debe proporcionar un motivo para condonar el recargo");
      return;
    }

    try {
      const resultado = await quitarRecargoRecibo(confirmQuitarRecargo.idRecibo, motivoQuitarRecargo);
      toast.success(resultado.message);
      setConfirmQuitarRecargo(null);
      if (criterio) {
        await buscar();
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 403) {
        toast.error("No tiene permisos para condonar recargos. Solo ADMIN, DIRECTOR o FINANZAS pueden realizar esta acción.");
      } else {
        toast.error(err.response?.data?.message || "Error al quitar el recargo");
      }
    }
  }

  async function handleConfirmCancelar() {
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
      if (criterio) await buscar();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error al cancelar el recibo");
    } finally {
      setProcesandoAccion(false);
    }
  }

  async function handleConfirmReversar() {
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
      if (criterio) await buscar();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Error al reversar el recibo");
    } finally {
      setProcesandoAccion(false);
    }
  }

  function handleOpenEditDetail(idRecibo: number, idReciboDetalle: number, descripcion: string, montoActual: number) {
    setEditingDetail({ idRecibo, idReciboDetalle, descripcion, montoActual });
    setNuevoMontoDetalle(montoActual.toString());
    setMotivoDetalle("");
  }

  async function handleSaveDetailEdit() {
    if (!editingDetail) return;

    const monto = parseFloat(nuevoMontoDetalle);
    if (isNaN(monto) || monto < 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (!motivoDetalle.trim()) {
      toast.error("Debe proporcionar un motivo para la modificación");
      return;
    }

    setGuardandoDetalle(true);
    try {
      const resultado = await modificarDetalleRecibo(
        editingDetail.idRecibo,
        editingDetail.idReciboDetalle,
        monto,
        motivoDetalle
      );

      if (resultado.exitoso) {
        toast.success(resultado.mensaje);
        setEditingDetail(null);
        if (criterio) {
          await buscar();
        }
      } else {
        toast.error(resultado.mensaje);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 403) {
        toast.error("No tiene permisos para modificar montos. Solo ADMIN, DIRECTOR o FINANZAS pueden realizar esta acción.");
      } else {
        toast.error(err.response?.data?.message || "Error al modificar el monto");
      }
    } finally {
      setGuardandoDetalle(false);
    }
  }

  function handleOpenEditRecargo(idRecibo: number, folio: string, recargoActual: number) {
    setEditingRecargo({ idRecibo, folio, recargoActual });
    setNuevoRecargo(recargoActual.toString());
    setMotivoRecargo("");
  }

  async function handleSaveRecargoEdit() {
    if (!editingRecargo) return;

    const recargo = parseFloat(nuevoRecargo);
    if (isNaN(recargo) || recargo < 0) {
      toast.error("Ingresa un recargo válido");
      return;
    }

    if (!motivoRecargo.trim()) {
      toast.error("Debe proporcionar un motivo para la modificación");
      return;
    }

    setGuardandoRecargo(true);
    try {
      const resultado = await modificarRecargoRecibo(
        editingRecargo.idRecibo,
        recargo,
        motivoRecargo
      );

      if (resultado.exitoso) {
        toast.success(resultado.mensaje);
        setEditingRecargo(null);
        if (criterio) {
          await buscar();
        }
      } else {
        toast.error(resultado.mensaje);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 403) {
        toast.error("No tiene permisos para modificar recargos. Solo ADMIN, DIRECTOR o FINANZAS pueden realizar esta acción.");
      } else {
        toast.error(err.response?.data?.message || "Error al modificar el recargo");
      }
    } finally {
      setGuardandoRecargo(false);
    }
  }

  function calcularTotalSeleccionado(): number {
    if (!resultado) return 0;

    return resultado.recibos
      .filter((r) => recibosSeleccionados.has(r.idRecibo))
      .reduce((sum, r) => {
        const recargoCalculado = calcularRecargo(r.fechaVencimiento, r.saldo);
        const fueModificado = r.notas?.includes("RECARGO CONDONADO") ||
                              r.notas?.includes("RECARGO MODIFICADO");
        const recargo = fueModificado ? (r.recargos ?? 0) : recargoCalculado;
        const total = r.saldo + recargo;
        return sum + total;
      }, 0);
  }

  function validarPago(): { valido: boolean; montoIngresado: number; totalSeleccionado: number } {
    if (recibosSeleccionados.size === 0) {
      toast.error("Selecciona al menos un recibo");
      return { valido: false, montoIngresado: 0, totalSeleccionado: 0 };
    }

    const totalSeleccionado = calcularTotalSeleccionado();
    const montoIngresado = parseFloat(monto);

    if (!montoIngresado || montoIngresado <= 0) {
      toast.error("Ingresa un monto válido");
      return { valido: false, montoIngresado, totalSeleccionado };
    }

    if (montoIngresado > totalSeleccionado + 0.01) {
      toast.error(
        `El monto ingresado (${formatCurrency(montoIngresado)}) excede el total seleccionado (${formatCurrency(totalSeleccionado)})`
      );
      return { valido: false, montoIngresado, totalSeleccionado };
    }

    return { valido: true, montoIngresado, totalSeleccionado };
  }

  async function procesarPago() {
    const { valido, montoIngresado, totalSeleccionado } = validarPago();
    if (!valido) return;

    setProcesando(true);
    try {
      const recibosConTotales = resultado!.recibos
        .filter((r) => recibosSeleccionados.has(r.idRecibo))
        .map((r) => {
          const recargoCalculado = calcularRecargo(r.fechaVencimiento, r.saldo);
          const fueModificado = r.notas?.includes("RECARGO CONDONADO") ||
                                r.notas?.includes("RECARGO MODIFICADO");
          const recargo = fueModificado ? (r.recargos ?? 0) : recargoCalculado;
          const total = r.saldo + recargo;
          return { idRecibo: r.idRecibo, total };
        });

      let montoRestante = montoIngresado;
      const recibosParaPago = recibosConTotales
        .map((r) => {
          if (montoRestante <= 0) return null;
          const montoAplicar = Math.min(r.total, montoRestante);
          montoRestante -= montoAplicar;
          return {
            idRecibo: r.idRecibo,
            montoAplicar: Math.round(montoAplicar * 100) / 100,
          };
        })
        .filter((r): r is { idRecibo: number; montoAplicar: number } => r !== null && r.montoAplicar > 0);

      const esPagoParcial = montoIngresado < totalSeleccionado - 0.01;
      if (esPagoParcial) {
        const recibosAfectados = recibosParaPago.length;
        toast.info(`Pago parcial: se aplicará a ${recibosAfectados} recibo(s)`);
      }

      const pagoRegistrado = await registrarPagoCaja({
        fechaPago: new Date().toISOString(),
        idMedioPago: medioPago,
        monto: montoIngresado,
        referencia: referencia || undefined,
        notas: notas || undefined,
        recibosSeleccionados: recibosParaPago,
      });

      toast.success(`Pago registrado exitosamente: ${pagoRegistrado.folioPago}`);

      if (pagoRegistrado.comprobante) {
        const blob = await descargarComprobantePago(pagoRegistrado.idPago);
        descargarComprobantePDF(blob, pagoRegistrado.folioPago);
      }

      limpiarFormulario();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Error al procesar el pago");
    } finally {
      setProcesando(false);
    }
  }

  function limpiarFormulario() {
    setResultado(null);
    setRecibosSeleccionados(new Set());
    setCriterio("");
    setMonto("");
    setReferencia("");
    setNotas("");
  }

  const totalSeleccionado = calcularTotalSeleccionado();
  const medioSeleccionado = mediosPago.find((m) => m.idMedioPago === medioPago);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <DollarSign className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Caja
          </h1>
          <p className="text-muted-foreground mt-1">Cobro de recibos y gestión de pagos</p>
        </div>
      </div>

      <Card className="border-2" style={{ borderColor: 'rgba(20, 53, 111, 0.2)' }}>
        <CardHeader style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.03), rgba(30, 74, 143, 0.05))' }}>
          <CardTitle style={{ color: '#14356F' }}>Buscar Alumno o Recibo</CardTitle>
          <CardDescription>
            Ingresa la matrícula del estudiante, nombre o folio del recibo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Matrícula, nombre o folio de recibo"
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                disabled={buscando}
              />
            </div>
            <Button
              onClick={buscar}
              disabled={buscando}
              className="text-white"
              style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
            >
              <Search className="w-4 h-4 mr-2" />
              {buscando ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="mostrarTodos"
              checked={mostrarTodos}
              onCheckedChange={(checked) => setMostrarTodos(checked as boolean)}
            />
            <label
              htmlFor="mostrarTodos"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Mostrar todos los recibos (incluidos pagados) - Para reversar pagos
            </label>
          </div>
        </CardContent>
      </Card>

      {resultado && resultado.estudiante && (
        <>
          <Card className="border-2" style={{ borderColor: 'rgba(20, 53, 111, 0.2)' }}>
            <CardHeader style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.03), rgba(30, 74, 143, 0.05))' }}>
              <CardTitle style={{ color: '#14356F' }}>Estudiante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Matrícula</Label>
                  <p className="font-mono font-semibold text-lg">
                    {resultado.estudiante.matricula}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nombre</Label>
                  <p className="font-semibold text-lg">
                    {resultado.estudiante.nombreCompleto}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Adeudo Total</Label>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(resultado.totalAdeudo)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 overflow-hidden" style={{ borderColor: 'rgba(20, 53, 111, 0.2)' }}>
            <CardHeader style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.03), rgba(30, 74, 143, 0.05))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{ color: '#14356F' }}>Recibos Pendientes ({resultado.recibos.length})</CardTitle>
                  <CardDescription>Selecciona los recibos a pagar - Haz clic en el folio para ver el desglose</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandirTodos}
                  style={{ borderColor: '#14356F', color: '#14356F' }}
                >
                  {recibosExpandidos.size === resultado.recibos.length ? "Colapsar Todos" : "Expandir Todos"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={recibosSeleccionados.size === resultado.recibos.length}
                        onCheckedChange={toggleTodos}
                      />
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-white font-semibold">Folio</TableHead>
                    <TableHead className="text-white font-semibold">Periodo</TableHead>
                    <TableHead className="text-white font-semibold">Vencimiento</TableHead>
                    <TableHead className="text-right text-white font-semibold">Saldo</TableHead>
                    <TableHead className="text-right text-white font-semibold">Recargo</TableHead>
                    <TableHead className="text-right text-white font-semibold">Total a Pagar</TableHead>
                    <TableHead className="text-white font-semibold">Estado</TableHead>
                    <TableHead className="text-white font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.recibos.map((recibo) => {
                    const recargoCalculado = calcularRecargo(recibo.fechaVencimiento, recibo.saldo);
                    const fueModificadoManualmente = recibo.notas?.includes("RECARGO CONDONADO") ||
                                                      recibo.notas?.includes("RECARGO MODIFICADO");
                    const recargo = fueModificadoManualmente
                      ? (recibo.recargos ?? 0)
                      : recargoCalculado;
                    const total = recibo.saldo + recargo;
                    const diasVencido = calcularDiasVencido(recibo.fechaVencimiento);
                    const isExpandido = recibosExpandidos.has(recibo.idRecibo);

                    return (
                      <Fragment key={recibo.idRecibo}>
                        <TableRow
                          className={isExpandido ? "border-b-0" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={recibosSeleccionados.has(recibo.idRecibo)}
                              onCheckedChange={() => toggleRecibo(recibo.idRecibo)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                              onClick={() => toggleExpandido(recibo.idRecibo)}
                            >
                              {isExpandido ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell
                            className="font-mono cursor-pointer hover:text-blue-600"
                            onClick={() => toggleExpandido(recibo.idRecibo)}
                          >
                            {recibo.folio}
                          </TableCell>
                          <TableCell>{recibo.nombrePeriodo}</TableCell>
                          <TableCell>
                            <div>
                              {new Date(recibo.fechaVencimiento).toLocaleDateString("es-MX")}
                              {diasVencido > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {diasVencido} día(s) vencido
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(recibo.saldo)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {recargo > 0 ? formatCurrency(recargo) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getReceiptStatusVariant(recibo.estatus)}>
                              {formatReceiptStatus(recibo.estatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-6 w-6"
                                onClick={async () => {
                                  try {
                                    await imprimirReciboPdf(recibo.idRecibo, recibo.folio ?? undefined);
                                  } catch (error) {
                                    toast.error("Error al generar el PDF del recibo");
                                    console.error(error);
                                  }
                                }}
                                title="Imprimir Recibo"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {isPaidOrPartial(recibo.estatus) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-6 w-6 text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                                  onClick={() => setConfirmReversar({ idRecibo: recibo.idRecibo, folio: recibo.folio || "", estatus: formatReceiptStatus(recibo.estatus) })}
                                  title="Reversar pago"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              {!isCanceledOrPaid(recibo.estatus) && !isPaidOrPartial(recibo.estatus) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-6 w-6 text-red-600 hover:text-red-800 hover:bg-red-50"
                                  onClick={() => setConfirmCancelar({ idRecibo: recibo.idRecibo, folio: recibo.folio || "" })}
                                  title="Cancelar recibo"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpandido && (
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableCell colSpan={10} className="py-0">
                              <div className="py-4 px-6">
                                <div className="text-sm font-semibold mb-2" style={{ color: '#14356F' }}>
                                  Desglose del Recibo {recibo.folio}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-slate-100">
                                      <TableHead className="text-xs font-semibold">No.</TableHead>
                                      <TableHead className="text-xs font-semibold">Descripción</TableHead>
                                      <TableHead className="text-xs font-semibold text-right">Cantidad</TableHead>
                                      <TableHead className="text-xs font-semibold text-right">P. Unitario</TableHead>
                                      <TableHead className="text-xs font-semibold text-right">Importe</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {recibo.detalles && recibo.detalles.length > 0 ? (
                                      recibo.detalles.map((detalle, idx) => (
                                        <TableRow key={detalle.idReciboDetalle || idx} className="border-b border-slate-200">
                                          <TableCell className="text-xs py-2">{idx + 1}</TableCell>
                                          <TableCell className="text-xs py-2">
                                            <div className="flex items-center gap-2">
                                              {detalle.descripcion}
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                onClick={() => handleOpenEditDetail(recibo.idRecibo, detalle.idReciboDetalle, detalle.descripcion, detalle.precioUnitario)}
                                                title="Modificar monto"
                                              >
                                                <Edit2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-xs py-2 text-right">{detalle.cantidad}</TableCell>
                                          <TableCell className="text-xs py-2 text-right">{formatCurrency(detalle.precioUnitario)}</TableCell>
                                          <TableCell className="text-xs py-2 text-right font-medium">{formatCurrency(detalle.importe)}</TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-4">
                                          Sin detalles disponibles
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow className="bg-slate-100 font-semibold">
                                      <TableCell colSpan={4} className="text-right text-xs">Subtotal:</TableCell>
                                      <TableCell className="text-right text-xs">{formatCurrency(recibo.subtotal)}</TableCell>
                                    </TableRow>
                                    {recibo.descuento > 0 && (
                                      <TableRow className="text-green-600">
                                        <TableCell colSpan={4} className="text-right text-xs">Descuento (Beca):</TableCell>
                                        <TableCell className="text-right text-xs">-{formatCurrency(recibo.descuento)}</TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow className={recargo > 0 ? "text-red-600" : "text-gray-500"}>
                                      <TableCell colSpan={2} className="text-right text-xs">Recargo por mora:</TableCell>
                                      <TableCell className="text-right text-xs">
                                        <div className="flex items-center justify-end gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            onClick={() => handleOpenEditRecargo(recibo.idRecibo, recibo.folio || "", recargo)}
                                            title={recargo > 0 ? "Modificar recargo" : "Agregar recargo"}
                                          >
                                            <Edit2 className="h-3 w-3 mr-1" />
                                            {recargo > 0 ? "Modificar" : "Agregar"}
                                          </Button>
                                          {recargo > 0 && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                                              onClick={() => handleOpenQuitarRecargo(recibo.idRecibo, recibo.folio || "")}
                                              title="Condonar recargo (requiere permisos)"
                                            >
                                              <Trash2 className="h-3 w-3 mr-1" />
                                              Quitar
                                            </Button>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right text-xs">
                                        {recargo > 0 ? `+${formatCurrency(recargo)}` : "-"}
                                      </TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow className="bg-blue-50 font-bold">
                                      <TableCell colSpan={4} className="text-right text-sm" style={{ color: '#14356F' }}>Total a Pagar Hoy:</TableCell>
                                      <TableCell className="text-right text-sm" style={{ color: '#14356F' }}>{formatCurrency(total)}</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {recibosSeleccionados.size > 0 && (
            <Card className="border-2" style={{ borderColor: 'rgba(20, 53, 111, 0.2)' }}>
              <CardHeader style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.03), rgba(30, 74, 143, 0.05))' }}>
                <CardTitle style={{ color: '#14356F' }}>Procesar Pago</CardTitle>
                <CardDescription>
                  Completa la información del pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medio de Pago</Label>
                    <Select
                      value={medioPago.toString()}
                      onValueChange={(v) => setMedioPago(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mediosPago.map((medio) => (
                          <SelectItem
                            key={medio.idMedioPago}
                            value={medio.idMedioPago.toString()}
                          >
                            {medio.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {medioSeleccionado?.requiereReferencia && (
                    <div className="space-y-2">
                      <Label>
                        Referencia <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Núm. de transferencia, voucher, etc."
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Monto a Pagar</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                  />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total de recibos seleccionados:{" "}
                      <span className="font-semibold text-foreground">
                        {formatCurrency(totalSeleccionado)}
                      </span>
                    </p>
                    {parseFloat(monto) > 0 && parseFloat(monto) < totalSeleccionado - 0.01 && (
                      <p className="text-sm text-amber-600 font-medium">
                        Pago parcial - Saldo restante: {formatCurrency(totalSeleccionado - parseFloat(monto))}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground italic">
                      Se permiten pagos parciales. El monto se aplica de forma secuencial a los recibos seleccionados.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notas (Opcional)</Label>
                  <Input
                    placeholder="Notas adicionales sobre el pago"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={limpiarFormulario} disabled={procesando}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>

                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      onClick={() => setMonto(totalSeleccionado.toFixed(2))}
                      style={{ borderColor: '#14356F', color: '#14356F' }}
                    >
                      Aplicar Total
                    </Button>
                    <Button
                      onClick={procesarPago}
                      disabled={procesando}
                      size="lg"
                      className="text-white"
                      style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {procesando ? "Procesando..." : `Cobrar ${formatCurrency(parseFloat(monto) || 0)}`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      <AlertDialog open={editingDetail !== null} onOpenChange={(open) => !open && setEditingDetail(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-blue-900">
              <Edit2 className="h-5 w-5" />
              Modificar Monto
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-gray-700">
                  Modificar el monto de: <strong>{editingDetail?.descripcion}</strong>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Monto actual:</span> {formatCurrency(editingDetail?.montoActual || 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nuevoMonto" className="text-gray-900">Nuevo monto *</Label>
                  <Input
                    id="nuevoMonto"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={nuevoMontoDetalle}
                    onChange={(e) => setNuevoMontoDetalle(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivoDetalle" className="text-gray-900">Motivo de la modificación *</Label>
                  <Input
                    id="motivoDetalle"
                    placeholder="Ej: Ajuste por cambio de precio"
                    value={motivoDetalle}
                    onChange={(e) => setMotivoDetalle(e.target.value)}
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    Esta acción quedará registrada en la bitácora del recibo y se reflejará en el PDF.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={guardandoDetalle}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveDetailEdit}
              disabled={guardandoDetalle || !motivoDetalle.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {guardandoDetalle ? "Guardando..." : "Guardar Cambios"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={editingRecargo !== null} onOpenChange={(open) => !open && setEditingRecargo(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-blue-900">
              <Edit2 className="h-5 w-5" />
              {(editingRecargo?.recargoActual ?? 0) > 0 ? "Modificar Recargo" : "Agregar Recargo"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-gray-700">
                  {(editingRecargo?.recargoActual ?? 0) > 0
                    ? <>Modificar el recargo del recibo: <strong>{editingRecargo?.folio}</strong></>
                    : <>Agregar recargo al recibo: <strong>{editingRecargo?.folio}</strong></>
                  }
                </p>
                {(editingRecargo?.recargoActual ?? 0) > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Recargo actual:</span> {formatCurrency(editingRecargo?.recargoActual || 0)}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="nuevoRecargo" className="text-gray-900">
                    {(editingRecargo?.recargoActual ?? 0) > 0 ? "Nuevo recargo *" : "Monto del recargo *"}
                  </Label>
                  <Input
                    id="nuevoRecargo"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={nuevoRecargo}
                    onChange={(e) => setNuevoRecargo(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivoRecargo" className="text-gray-900">Motivo *</Label>
                  <Input
                    id="motivoRecargo"
                    placeholder={(editingRecargo?.recargoActual ?? 0) > 0 ? "Ej: Acuerdo de pago" : "Ej: Recargo por mora"}
                    value={motivoRecargo}
                    onChange={(e) => setMotivoRecargo(e.target.value)}
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    Esta acción quedará registrada en la bitácora del recibo y se reflejará en el PDF.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={guardandoRecargo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveRecargoEdit}
              disabled={guardandoRecargo || !motivoRecargo.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {guardandoRecargo ? "Guardando..." : "Guardar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmQuitarRecargo !== null} onOpenChange={(open) => !open && setConfirmQuitarRecargo(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Condonar Recargo
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-gray-700">
                  ¿Está seguro que desea condonar el recargo del recibo <strong>{confirmQuitarRecargo?.folio}</strong>?
                </p>
                <div className="space-y-2">
                  <Label htmlFor="motivoQuitar" className="text-gray-900">Motivo de la condonación *</Label>
                  <Input
                    id="motivoQuitar"
                    placeholder="Ej: Acuerdo con el estudiante"
                    value={motivoQuitarRecargo}
                    onChange={(e) => setMotivoQuitarRecargo(e.target.value)}
                  />
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-800">
                    Esta acción eliminará el recargo por completo y quedará registrada en la bitácora.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmQuitarRecargo}
              disabled={!motivoQuitarRecargo.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Condonar Recargo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para cancelar recibo */}
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
    </div>
  );
}
