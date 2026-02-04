"use client";

import { useEffect, useState } from "react";

import { Search, User } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { aplicarPago, buscarRecibosParaCobro } from "@/services/payments-service";
import type { RecibosParaCobro } from "@/types/payment";
import type { Receipt } from "@/types/receipt";

interface ApplyPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  idPago: number;
  montoPago: number;
}

export function ApplyPaymentModal({ open, onOpenChange, onSuccess, idPago, montoPago }: ApplyPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [criterio, setCriterio] = useState("");
  const [resultado, setResultado] = useState<RecibosParaCobro | null>(null);
  const [recibosSeleccionados, setRecibosSeleccionados] = useState<Set<number>>(new Set());
  const [montosAplicar, setMontosAplicar] = useState<Record<number, number>>({});

  useEffect(() => {
    if (open) {
      setCriterio("");
      setResultado(null);
      setRecibosSeleccionados(new Set());
      setMontosAplicar({});
    }
  }, [open]);

  const buscar = async () => {
    if (!criterio.trim()) {
      toast.error("Ingresa una matrícula o nombre del estudiante");
      return;
    }

    setBuscando(true);
    try {
      const data = await buscarRecibosParaCobro(criterio.trim());

      if (data.multiple && data.estudiantes) {
        toast.error("Se encontraron múltiples estudiantes. Sé más específico en la búsqueda.");
        setResultado(null);
      } else if (data.recibos.length === 0) {
        toast.info("No se encontraron recibos pendientes para este estudiante");
        setResultado(null);
      } else {
        setResultado(data);
        const montosIniciales: Record<number, number> = {};
        let disponible = montoPago;
        for (const recibo of data.recibos) {
          const montoRecibo = recibo.saldo + (recibo.recargos ?? 0);
          const montoAAplicar = Math.min(montoRecibo, disponible);
          montosIniciales[recibo.idRecibo] = montoAAplicar;
          disponible -= montoAAplicar;
          if (disponible <= 0) break;
        }
        setMontosAplicar(montosIniciales);
        toast.success(`Se encontraron ${data.recibos.length} recibo(s) pendiente(s)`);
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "No se encontró el estudiante");
      setResultado(null);
    } finally {
      setBuscando(false);
    }
  };

  const toggleRecibo = (idRecibo: number) => {
    const newSet = new Set(recibosSeleccionados);
    if (newSet.has(idRecibo)) {
      newSet.delete(idRecibo);
    } else {
      newSet.add(idRecibo);
    }
    setRecibosSeleccionados(newSet);
  };

  const handleMontoChange = (idRecibo: number, valor: string) => {
    const monto = parseFloat(valor) || 0;
    setMontosAplicar(prev => ({ ...prev, [idRecibo]: monto }));
  };

  const calcularTotalAplicar = (): number => {
    return Array.from(recibosSeleccionados).reduce((sum, idRecibo) => {
      return sum + (montosAplicar[idRecibo] || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recibosSeleccionados.size === 0) {
      toast.error("Selecciona al menos un recibo");
      return;
    }

    const totalAplicar = calcularTotalAplicar();
    if (totalAplicar <= 0) {
      toast.error("El monto a aplicar debe ser mayor a 0");
      return;
    }

    if (totalAplicar > montoPago + 0.01) {
      toast.error("El monto total excede el monto del pago");
      return;
    }

    const aplicaciones: { idReciboDetalle: number; monto: number }[] = [];

    for (const idRecibo of recibosSeleccionados) {
      const recibo = resultado?.recibos.find(r => r.idRecibo === idRecibo);
      if (!recibo || !recibo.detalles || recibo.detalles.length === 0) continue;

      let montoRestante = montosAplicar[idRecibo] || 0;

      for (const detalle of recibo.detalles) {
        if (montoRestante <= 0) break;
        const montoDetalle = Math.min(detalle.precioUnitario * detalle.cantidad, montoRestante);
        aplicaciones.push({
          idReciboDetalle: detalle.idReciboDetalle,
          monto: montoDetalle,
        });
        montoRestante -= montoDetalle;
      }
    }

    if (aplicaciones.length === 0) {
      toast.error("No se pudieron determinar los detalles de los recibos");
      return;
    }

    setLoading(true);

    try {
      await aplicarPago({ idPago, aplicaciones });
      toast.success("Pago aplicado exitosamente a los recibos seleccionados");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Error al aplicar el pago");
    } finally {
      setLoading(false);
    }
  };

  const totalAplicar = calcularTotalAplicar();
  const disponible = montoPago - totalAplicar;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Aplicar Pago a Recibos
            </DialogTitle>
            <DialogDescription>
              Pago #{idPago} - Monto: <span className="font-semibold text-foreground">{formatCurrency(montoPago)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Buscar Estudiante</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Matrícula o nombre del estudiante"
                  value={criterio}
                  onChange={(e) => setCriterio(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), buscar())}
                  disabled={buscando}
                />
                <Button type="button" onClick={buscar} disabled={buscando} variant="secondary">
                  <Search className="w-4 h-4 mr-2" />
                  {buscando ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
            {resultado?.estudiante && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{resultado.estudiante.nombreCompleto}</p>
                    <p className="text-sm text-blue-700">
                      Matrícula: <span className="font-mono font-semibold">{resultado.estudiante.matricula}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">Adeudo Total</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(resultado.totalAdeudo)}</p>
                  </div>
                </div>
              </div>
            )}
            {resultado && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Monto del Pago</p>
                  <p className="text-lg font-bold">{formatCurrency(montoPago)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">A Aplicar</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalAplicar)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Restante</p>
                  <p className={`text-lg font-bold ${disponible < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {formatCurrency(disponible)}
                  </p>
                </div>
              </div>
            )}
            {resultado && resultado.recibos.length > 0 && (
              <div className="space-y-2">
                <Label>Recibos Pendientes ({resultado.recibos.length})</Label>
                <div className="max-h-[300px] overflow-y-auto border rounded-lg divide-y">
                  {resultado.recibos.map((recibo: Receipt) => {
                    const isSelected = recibosSeleccionados.has(recibo.idRecibo);
                    const totalRecibo = recibo.saldo + (recibo.recargos ?? 0);

                    return (
                      <div
                        key={recibo.idRecibo}
                        className={`p-3 ${isSelected ? 'bg-blue-50' : 'bg-white'} hover:bg-slate-50 transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRecibo(recibo.idRecibo)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-sm">{recibo.folio}</span>
                              <Badge variant="outline" className="text-xs">
                                {recibo.nombrePeriodo || `Periodo ${recibo.idPeriodoAcademico}`}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Vence: {new Date(recibo.fechaVencimiento).toLocaleDateString("es-MX")}
                              {recibo.detalles?.map(d => d.descripcion).join(", ")}
                            </div>
                            <div className="flex gap-4 mt-1 text-sm">
                              <span>Saldo: <span className="font-semibold">{formatCurrency(recibo.saldo)}</span></span>
                              {(recibo.recargos ?? 0) > 0 && (
                                <span className="text-red-600">Recargo: {formatCurrency(recibo.recargos ?? 0)}</span>
                              )}
                              <span className="font-bold">Total: {formatCurrency(totalRecibo)}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-32">
                              <Label className="text-xs">Monto a aplicar</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={totalRecibo}
                                value={montosAplicar[recibo.idRecibo] || 0}
                                onChange={(e) => handleMontoChange(recibo.idRecibo, e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {disponible < -0.01 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  El monto a aplicar excede el monto del pago por {formatCurrency(Math.abs(disponible))}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || recibosSeleccionados.size === 0 || disponible < -0.01}
            >
              {loading ? "Aplicando..." : `Aplicar ${formatCurrency(totalAplicar)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
