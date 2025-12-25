"use client";

import { useState, useEffect } from "react";
import { Search, DollarSign, Check, X, Receipt as ReceiptIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Receipt, ReceiptStatus } from "@/types/receipt";
import { MedioPago, RecibosParaCobro } from "@/types/payment";
import { buscarRecibosParaCobro, registrarPagoCaja, obtenerMediosPago, descargarComprobantePago } from "@/services/payments-service";
import {
  calcularRecargo,
  calcularDiasVencido,
  calcularTotalAPagarHoy,
  formatCurrency,
  formatReceiptStatus,
  getReceiptStatusVariant,
  descargarComprobantePDF,
} from "@/lib/payment-utils";

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se encontró el estudiante o recibo");
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

  function calcularTotalSeleccionado(): number {
    if (!resultado) return 0;

    return resultado.recibos
      .filter((r) => recibosSeleccionados.has(r.idRecibo))
      .reduce((sum, r) => {
        const total = calcularTotalAPagarHoy(r.fechaVencimiento, r.saldo);
        return sum + total;
      }, 0);
  }

  async function procesarPago() {
    if (recibosSeleccionados.size === 0) {
      toast.error("Selecciona al menos un recibo");
      return;
    }

    const totalSeleccionado = calcularTotalSeleccionado();
    const montoIngresado = parseFloat(monto);

    if (!montoIngresado || montoIngresado <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (Math.abs(montoIngresado - totalSeleccionado) > 0.01) {
      toast.error(
        `El monto ingresado (${formatCurrency(montoIngresado)}) no coincide con el total seleccionado (${formatCurrency(totalSeleccionado)})`
      );
      return;
    }

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

      // Descargar comprobante si está disponible
      if (pagoRegistrado.comprobante) {
        const blob = await descargarComprobantePago(pagoRegistrado.idPago);
        descargarComprobantePDF(blob, pagoRegistrado.folioPago);
      }

      // Limpiar formulario
      limpiarFormulario();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al procesar el pago");
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Caja
          </h1>
          <p className="text-muted-foreground">Cobro de recibos y gestión de pagos</p>
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Alumno o Recibo</CardTitle>
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
            <Button onClick={buscar} disabled={buscando}>
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
          <Card>
            <CardHeader>
              <CardTitle>Estudiante</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Recibos Pendientes ({resultado.recibos.length})</CardTitle>
              <CardDescription>Selecciona los recibos a pagar</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={recibosSeleccionados.size === resultado.recibos.length}
                        onCheckedChange={toggleTodos}
                      />
                    </TableHead>
                    <TableHead>Folio</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Recargo</TableHead>
                    <TableHead className="text-right">Total a Pagar</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.recibos.map((recibo) => {
                    const recargo = calcularRecargo(recibo.fechaVencimiento, recibo.saldo);
                    const total = recibo.saldo + recargo;
                    const diasVencido = calcularDiasVencido(recibo.fechaVencimiento);

                    return (
                      <TableRow key={recibo.idRecibo}>
                        <TableCell>
                          <Checkbox
                            checked={recibosSeleccionados.has(recibo.idRecibo)}
                            onCheckedChange={() => toggleRecibo(recibo.idRecibo)}
                          />
                        </TableCell>
                        <TableCell className="font-mono">{recibo.folio}</TableCell>
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Formulario de Pago */}
          {recibosSeleccionados.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Procesar Pago</CardTitle>
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
                    <Button variant="outline" onClick={() => setMonto(totalSeleccionado.toFixed(2))}>
                      Aplicar Total
                    </Button>
                    <Button onClick={procesarPago} disabled={procesando} size="lg">
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
