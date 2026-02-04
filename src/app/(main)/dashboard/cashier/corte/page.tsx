"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, DollarSign, FileText, Lock, RefreshCcw, User } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/payment-utils";
import { cn } from "@/lib/utils";
import {
  obtenerCajeros,
  generarCorteCajaDetallado,
  generarPdfCorteCaja,
  cerrarCorteCaja,
} from "@/services/payments-service";
import {
  UsuarioCajero,
  ResumenCorteCajaDetallado,
  GenerarCorteCajaRequest,
} from "@/types/payment";

export default function CorteCajaPage() {
  const [cajeros, setCajeros] = useState<UsuarioCajero[]>([]);
  const [cajeroSeleccionado, setCajeroSeleccionado] = useState<string>("all");
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());

  const [resumen, setResumen] = useState<ResumenCorteCajaDetallado | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCajeros, setLoadingCajeros] = useState(true);

  const [cerrarModalOpen, setCerrarModalOpen] = useState(false);
  const [montoInicial, setMontoInicial] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarCajeros();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    setFechaInicio(hoy);
    setFechaFin(new Date());
  }, []);

  async function cargarCajeros() {
    setLoadingCajeros(true);
    try {
      const lista = await obtenerCajeros();
      setCajeros(lista);
    } catch (error) {
      console.error("Error al cargar cajeros:", error);
    } finally {
      setLoadingCajeros(false);
    }
  }

  async function generarCorte() {
    setLoading(true);
    try {
      const request: GenerarCorteCajaRequest = {
        idUsuarioCaja: cajeroSeleccionado !== "all" ? cajeroSeleccionado : undefined,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
      };

      const resultado = await generarCorteCajaDetallado(request);
      setResumen(resultado);

      if (resultado.pagos.length === 0) {
        toast.info("No se encontraron pagos en el período seleccionado");
      } else {
        toast.success(`Se encontraron ${resultado.pagos.length} pagos`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al generar corte de caja");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function descargarPdf() {
    if (!resumen) return;

    setLoadingPdf(true);
    try {
      const request: GenerarCorteCajaRequest = {
        idUsuarioCaja: cajeroSeleccionado !== "all" ? cajeroSeleccionado : undefined,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
      };

      const blob = await generarPdfCorteCaja(request);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CorteCaja_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF descargado correctamente");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al generar PDF");
      console.error(error);
    } finally {
      setLoadingPdf(false);
    }
  }

  async function handleCerrarCorte() {
    if (!montoInicial || parseFloat(montoInicial) < 0) {
      toast.error("Ingresa el monto inicial del fondo");
      return;
    }

    setProcesando(true);
    try {
      const corte = await cerrarCorteCaja({
        montoInicial: parseFloat(montoInicial),
        observaciones: observaciones || undefined,
      });

      toast.success(`Corte de caja cerrado: ${corte.folioCorteCaja}`);

      await descargarPdf();

      setCerrarModalOpen(false);
      setMontoInicial("");
      setObservaciones("");
      generarCorte();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cerrar corte");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Corte de Caja
          </h1>
          <p className="text-muted-foreground">Genera reportes de cobros por cajero y período</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
          <CardDescription>Selecciona el cajero y el rango de fechas para generar el corte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Cajero</Label>
              <Select
                value={cajeroSeleccionado}
                onValueChange={setCajeroSeleccionado}
                disabled={loadingCajeros}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los cajeros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cajeros</SelectItem>
                  {cajeros.map((cajero) => (
                    <SelectItem key={cajero.idUsuario} value={cajero.idUsuario || `cajero-${cajero.nombreCompleto}`}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{cajero.nombreCompleto}</span>
                        <Badge variant="secondary" className="text-xs">
                          {cajero.totalCobros} cobros
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaInicio && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fechaInicio}
                    onSelect={(date) => date && setFechaInicio(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaFin && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fechaFin}
                    onSelect={(date) => date && setFechaFin(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="invisible">Acciones</Label>
              <div className="flex gap-2">
                <Button onClick={generarCorte} disabled={loading} className="flex-1">
                  <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  {loading ? "Generando..." : "Generar"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {resumen && (
        <>
          <div className="flex items-center justify-between">
            <div>
              {resumen.cajero && (
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{resumen.cajero.nombreCompleto}</span>
                  {resumen.cajero.email && (
                    <span className="text-sm text-muted-foreground">({resumen.cajero.email})</span>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Período: {format(new Date(resumen.fechaInicio), "dd/MM/yyyy HH:mm")} -{" "}
                {format(new Date(resumen.fechaFin), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={descargarPdf} disabled={loadingPdf || resumen.pagos.length === 0}>
                <FileText className="w-4 h-4 mr-2" />
                {loadingPdf ? "Generando..." : "Descargar PDF"}
              </Button>
              <Button onClick={() => setCerrarModalOpen(true)} disabled={resumen.pagos.length === 0}>
                <Lock className="w-4 h-4 mr-2" />
                Cerrar Corte
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Efectivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(resumen.totales.efectivo)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumen.pagos.filter((p) => p.idMedioPago === 1).length} pago(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Transferencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(resumen.totales.transferencia)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumen.pagos.filter((p) => p.idMedioPago === 2).length} pago(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Tarjeta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(resumen.totales.tarjeta)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resumen.pagos.filter((p) => p.idMedioPago === 3).length} pago(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Operaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumen.totales.cantidad}</div>
                <p className="text-xs text-muted-foreground mt-1">pagos totales</p>
              </CardContent>
            </Card>

            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(resumen.totales.total)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">recaudado</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Pagos ({resumen.pagos.length})</CardTitle>
              <CardDescription>
                Todos los pagos realizados en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resumen.pagos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron pagos en el período seleccionado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Medio de Pago</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumen.pagos.map((pago) => (
                      <TableRow key={pago.idPago}>
                        <TableCell className="font-mono text-sm">{pago.folioPago || "-"}</TableCell>
                        <TableCell>{pago.horaPago || format(new Date(pago.fechaPagoUtc), "HH:mm")}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pago.nombreEstudiante || "Sin información"}</div>
                            <div className="text-xs text-muted-foreground">{pago.matricula || ""}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="max-w-[200px] truncate">{pago.concepto || "Sin concepto"}</div>
                            {pago.folioRecibo && (
                              <div className="text-xs text-muted-foreground">Recibo: {pago.folioRecibo}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{pago.medioPago || "Desconocido"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pago.referencia || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(pago.monto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!resumen && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Genera un corte de caja</h3>
            <p className="text-muted-foreground">
              Selecciona los filtros deseados y haz clic en &quot;Generar&quot; para ver el reporte
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={cerrarModalOpen} onOpenChange={setCerrarModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Corte de Caja</DialogTitle>
            <DialogDescription>
              Completa la información para cerrar el corte. Esta acción generará un registro permanente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {resumen && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Efectivo:</span>
                  <span className="font-semibold">{formatCurrency(resumen.totales.efectivo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Transferencias:</span>
                  <span className="font-semibold">{formatCurrency(resumen.totales.transferencia)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tarjetas:</span>
                  <span className="font-semibold">{formatCurrency(resumen.totales.tarjeta)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(resumen.totales.total)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="montoInicial">
                Monto Inicial (Fondo Fijo) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="montoInicial"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Ingresa el monto con el que iniciaste el día</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas sobre el cierre del día"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
              />
            </div>

            {montoInicial && resumen && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Efectivo a entregar:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(resumen.totales.efectivo + parseFloat(montoInicial))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monto inicial + cobros en efectivo del día
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCerrarModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCerrarCorte} disabled={!montoInicial || procesando}>
              <Lock className="w-4 h-4 mr-2" />
              {procesando ? "Cerrando..." : "Cerrar Corte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
