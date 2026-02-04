"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { actualizarBeca } from "@/services/becas-service";
import { getAcademicPeriods } from "@/services/catalogs-service";
import { AcademicPeriod } from "@/types/catalog";
import { BecaEstudiante } from "@/types/receipt";

interface Props {
  open: boolean;
  onClose: (shouldReload?: boolean) => void;
  beca: BecaEstudiante | null;
}

export function EditarBecaModal({ open, onClose, beca }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);

  const [usarPeriodo, setUsarPeriodo] = useState(false);
  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("");
  const [vigenciaDesde, setVigenciaDesde] = useState("");
  const [vigenciaHasta, setVigenciaHasta] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [activo, setActivo] = useState(true);

  const periodoSeleccionado = periodos.find(
    (p) => p.idPeriodoAcademico.toString() === idPeriodoAcademico
  );

  useEffect(() => {
    if (open) {
      cargarPeriodos();
    }
  }, [open]);

  useEffect(() => {
    if (open && beca) {
      if (beca.idPeriodoAcademico) {
        setUsarPeriodo(true);
        setIdPeriodoAcademico(beca.idPeriodoAcademico.toString());
      } else {
        setUsarPeriodo(false);
        setIdPeriodoAcademico("");
      }

      setVigenciaDesde(formatDateForInput(beca.vigenciaDesde));
      setVigenciaHasta(beca.vigenciaHasta ? formatDateForInput(beca.vigenciaHasta) : "");
      setObservaciones(beca.observaciones || "");
      setActivo(beca.activo);
    }
  }, [open, beca]);

  useEffect(() => {
    if (periodoSeleccionado && usarPeriodo) {
      setVigenciaDesde(formatDateForInput(periodoSeleccionado.fechaInicio));
      setVigenciaHasta(formatDateForInput(periodoSeleccionado.fechaFin));
    }
  }, [periodoSeleccionado, usarPeriodo]);

  function formatDateForInput(dateStr: string): string {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.split("T")[0];
  }

  async function cargarPeriodos() {
    setLoadingPeriodos(true);
    try {
      const data = await getAcademicPeriods();
      setPeriodos(data);
    } catch (error) {
      toast.error("Error al cargar períodos académicos");
      console.error(error);
    } finally {
      setLoadingPeriodos(false);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!beca) return;

    if (usarPeriodo && !idPeriodoAcademico) {
      toast.error("Selecciona un período académico");
      return;
    }

    if (!usarPeriodo && !vigenciaDesde) {
      toast.error("La fecha de inicio es requerida");
      return;
    }

    if (!usarPeriodo && vigenciaHasta && new Date(vigenciaHasta) < new Date(vigenciaDesde)) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setLoading(true);

    try {
      await actualizarBeca(beca.idBecaAsignacion, {
        idPeriodoAcademico: usarPeriodo ? parseInt(idPeriodoAcademico) : null,
        vigenciaDesde: usarPeriodo ? periodoSeleccionado!.fechaInicio : vigenciaDesde,
        vigenciaHasta: usarPeriodo ? periodoSeleccionado!.fechaFin : (vigenciaHasta || null),
        observaciones: observaciones.trim() || null,
        activo,
      });

      toast.success("Beca actualizada exitosamente");
      onClose(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error al actualizar beca"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!beca) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Beca</DialogTitle>
          <DialogDescription>
            Modifica la vigencia y observaciones de la beca asignada
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {beca.beca?.nombre || `Beca ${beca.tipo}`}
            </span>
            <Badge variant={beca.tipo === "PORCENTAJE" ? "default" : "secondary"}>
              {beca.tipo === "PORCENTAJE" ? "Porcentaje" : "Monto Fijo"}
            </Badge>
          </div>
          <div className="text-sm">
            <span className="font-medium">Descuento: </span>
            {beca.tipo === "PORCENTAJE"
              ? `${beca.valor}%`
              : `$${beca.valor.toLocaleString("es-MX")}`}
            {beca.topeMensual && (
              <span className="text-muted-foreground">
                {" "}
                (Tope: ${beca.topeMensual.toLocaleString("es-MX")})
              </span>
            )}
          </div>
          {beca.nombreConcepto && (
            <div className="text-sm">
              <span className="font-medium">Aplica a: </span>
              {beca.nombreConcepto}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="activo" className="font-medium">Estado de la beca</Label>
              <p className="text-sm text-muted-foreground">
                {activo ? "La beca está activa y se aplicará a los recibos" : "La beca está inactiva"}
              </p>
            </div>
            <Switch
              id="activo"
              checked={activo}
              onCheckedChange={setActivo}
            />
          </div>

          <div className="space-y-3">
            <Label>Vigencia de la Beca</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={usarPeriodo ? "default" : "outline"}
                size="sm"
                onClick={() => setUsarPeriodo(true)}
              >
                Por Período
              </Button>
              <Button
                type="button"
                variant={!usarPeriodo ? "default" : "outline"}
                size="sm"
                onClick={() => setUsarPeriodo(false)}
              >
                Fechas Manuales
              </Button>
            </div>
          </div>

          {usarPeriodo ? (
            <div className="space-y-2">
              <Label htmlFor="periodo">Período Académico</Label>
              {loadingPeriodos ? (
                <div className="text-sm text-muted-foreground">
                  Cargando períodos...
                </div>
              ) : (
                <Select value={idPeriodoAcademico} onValueChange={setIdPeriodoAcademico}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un período..." />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos.map((periodo) => (
                      <SelectItem
                        key={periodo.idPeriodoAcademico}
                        value={periodo.idPeriodoAcademico.toString()}
                      >
                        {periodo.nombre}
                        {periodo.esPeriodoActual && " (Actual)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {periodoSeleccionado && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {formatDate(periodoSeleccionado.fechaInicio)} - {formatDate(periodoSeleccionado.fechaFin)}
                  </Badge>
                  <span className="text-green-600">
                    Las fechas se asignan automáticamente
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vigenciaDesde">Fecha de Inicio</Label>
                <Input
                  id="vigenciaDesde"
                  type="date"
                  value={vigenciaDesde}
                  onChange={(e) => setVigenciaDesde(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vigenciaHasta">Fecha de Fin (Opcional)</Label>
                <Input
                  id="vigenciaHasta"
                  type="date"
                  value={vigenciaHasta}
                  onChange={(e) => setVigenciaHasta(e.target.value)}
                  min={vigenciaDesde}
                />
                <p className="text-xs text-muted-foreground">
                  Dejar vacío para beca sin fecha de expiración
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Extendida al siguiente período por buen desempeño"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (usarPeriodo && !idPeriodoAcademico)}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
