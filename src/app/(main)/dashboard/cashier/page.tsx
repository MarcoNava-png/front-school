"use client";

import { Fragment, useEffect, useState } from "react";

import { Check, ChevronDown, ChevronRight, DollarSign, FileText, Printer, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

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
} from "@/lib/payment-utils";
import { buscarRecibosParaCobro, descargarComprobantePago, imprimirReciboPdf, obtenerMediosPago, quitarRecargoRecibo, registrarPagoCaja } from "@/services/payments-service";
import type { MedioPago, RecibosParaCobro } from "@/types/payment";
import type { Receipt } from "@/types/receipt";

export default function CashierPage() {
  // Estado de búsqueda
  const [criterio, setCriterio] = useState("");
  const [buscando, setBuscando] = useState(false);

  // Estado de resultados
  const [resultado, setResultado] = useState<RecibosParaCobro | null>(null);

  // Estado de selección de recibos
  const [recibosSeleccionados, setRecibosSeleccionados] = useState<Set<number>>(new Set());

  // Estado del formulario de pago
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [medioPago, setMedioPago] = useState<number>(1);
  const [monto, setMonto] = useState<string>("");
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");

  // Estado de procesamiento
  const [procesando, setProcesando] = useState(false);

  // Estado para recibos expandidos (mostrar desglose)
  const [recibosExpandidos, setRecibosExpandidos] = useState<Set<number>>(new Set());

  // Cargar medios de pago al montar
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
      const data = await buscarRecibosParaCobro(criterio.trim());

      if (data.multiple && data.estudiantes) {
        toast.error("Se encontraron múltiples estudiantes. Sé más específico en la búsqueda.");
        setResultado(null);
      } else if (data.recibos.length === 0) {
        toast.info("No se encontraron recibos pendientes");
        setResultado(null);
      } else {
        setResultado(data);
        setRecibosSeleccionados(new Set());
        toast.success(`Se encontraron ${data.recibos.length} recibo(s) pendiente(s)`);
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

  async function handleQuitarRecargo(idRecibo: number, folio: string) {
    const motivo = prompt(`¿Cuál es el motivo para condonar el recargo del recibo ${folio}?`);
    if (!motivo) {
      toast.error("Debe proporcionar un motivo para condonar el recargo");
      return;
    }

    try {
      const resultado = await quitarRecargoRecibo(idRecibo, motivo);
      toast.success(resultado.message);
      // Recargar los recibos para reflejar el cambio
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

  function calcularTotalSeleccionado(): number {
    if (!resultado) return 0;

    return resultado.recibos
      .filter((r) => recibosSeleccionados.has(r.idRecibo))
      .reduce((sum, r) => {
        const total = calcularTotalAPagarHoy(r.fechaVencimiento, r.saldo);
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

    if (Math.abs(montoIngresado - totalSeleccionado) > 0.01) {
      toast.error(
        `El monto ingresado (${formatCurrency(montoIngresado)}) no coincide con el total seleccionado (${formatCurrency(totalSeleccionado)})`
      );
      return { valido: false, montoIngresado, totalSeleccionado };
    }

    return { valido: true, montoIngresado, totalSeleccionado };
  }

  async function procesarPago() {
    const { valido, montoIngresado } = validarPago();
    if (!valido) return;

    setProcesando(true);
    try {
      const recibosParaPago = resultado!.recibos
        .filter((r) => recibosSeleccionados.has(r.idRecibo))
        .map((r) => ({
          idRecibo: r.idRecibo,
          montoAplicar: calcularTotalAPagarHoy(r.fechaVencimiento, r.saldo),
        }));

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

      {/* Búsqueda */}
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
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado && resultado.estudiante && (
        <>
          {/* Datos del Estudiante */}
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

          {/* Recibos Pendientes */}
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
                    <TableHead className="text-white font-semibold w-12">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.recibos.map((recibo) => {
                    const recargo = calcularRecargo(recibo.fechaVencimiento, recibo.saldo);
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
                          </TableCell>
                        </TableRow>
                        {/* Fila de desglose expandible */}
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
                                          <TableCell className="text-xs py-2">{detalle.descripcion}</TableCell>
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
                                    {/* Fila de totales */}
                                    <TableRow className="bg-slate-100 font-semibold">
                                      <TableCell colSpan={4} className="text-right text-xs">Subtotal:</TableCell>
                                      <TableCell className="text-right text-xs">{formatCurrency(recibo.subtotal)}</TableCell>
                                    </TableRow>
                                    {recibo.descuento > 0 && (
                                      <TableRow className="text-green-600">
                                        <TableCell colSpan={4} className="text-right text-xs">Descuento:</TableCell>
                                        <TableCell className="text-right text-xs">-{formatCurrency(recibo.descuento)}</TableCell>
                                      </TableRow>
                                    )}
                                    {recargo > 0 && (
                                      <TableRow className="text-red-600">
                                        <TableCell colSpan={3} className="text-right text-xs">Recargo por mora:</TableCell>
                                        <TableCell className="text-right text-xs">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                                            onClick={() => handleQuitarRecargo(recibo.idRecibo, recibo.folio || "")}
                                            title="Condonar recargo (requiere permisos)"
                                          >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Quitar
                                          </Button>
                                        </TableCell>
                                        <TableCell className="text-right text-xs">+{formatCurrency(recargo)}</TableCell>
                                      </TableRow>
                                    )}
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

          {/* Formulario de Pago */}
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
                  <Label>Monto Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Total de recibos seleccionados:{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(totalSeleccionado)}
                    </span>
                  </p>
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
    </div>
  );
}
