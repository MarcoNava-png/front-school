"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

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
import { Textarea } from "@/components/ui/textarea";
import { obtenerCatalogoBecas } from "@/services/beca-catalogo-service";
import { asignarBecaDesdeCatalogo } from "@/services/becas-service";
import { getAcademicPeriods } from "@/services/catalogs-service";
import { AcademicPeriod } from "@/types/catalog";
import { BecaCatalogo } from "@/types/receipt";

interface Props {
  open: boolean;
  onClose: () => void;
  idEstudiante: number;
}

export function AsignarBecaModal({ open, onClose, idEstudiante }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [catalogoBecas, setCatalogoBecas] = useState<BecaCatalogo[]>([]);
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);

  const [idBeca, setIdBeca] = useState<string>("");
  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("");
  const [usarPeriodo, setUsarPeriodo] = useState(true);
  const [vigenciaDesde, setVigenciaDesde] = useState("");
  const [vigenciaHasta, setVigenciaHasta] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const becaSeleccionada = catalogoBecas.find(
    (b) => b.idBeca.toString() === idBeca
  );

  const periodoSeleccionado = periodos.find(
    (p) => p.idPeriodoAcademico.toString() === idPeriodoAcademico
  );

  useEffect(() => {
    if (open) {
      cargarCatalogo();
      cargarPeriodos();
    }
  }, [open]);

  useEffect(() => {
    if (periodoSeleccionado && usarPeriodo) {
      setVigenciaDesde(periodoSeleccionado.fechaInicio);
      setVigenciaHasta(periodoSeleccionado.fechaFin);
    }
  }, [periodoSeleccionado, usarPeriodo]);

  async function cargarCatalogo() {
    setLoadingCatalogo(true);
    try {
      const data = await obtenerCatalogoBecas(true);
      setCatalogoBecas(data);
    } catch (error) {
      toast.error("Error al cargar catálogo de becas");
      console.error(error);
    } finally {
      setLoadingCatalogo(false);
    }
  }

  async function cargarPeriodos() {
    setLoadingPeriodos(true);
    try {
      const data = await getAcademicPeriods();
      setPeriodos(data);
      const periodoActual = data.find((p: AcademicPeriod) => p.esPeriodoActual);
      if (periodoActual) {
        setIdPeriodoAcademico(periodoActual.idPeriodoAcademico.toString());
      }
    } catch (error) {
      toast.error("Error al cargar períodos académicos");
      console.error(error);
    } finally {
      setLoadingPeriodos(false);
    }
  }

  function resetForm() {
    setIdBeca("");
    setIdPeriodoAcademico("");
    setUsarPeriodo(true);
    setVigenciaDesde("");
    setVigenciaHasta("");
    setObservaciones("");
    const periodoActual = periodos.find((p) => p.esPeriodoActual);
    if (periodoActual) {
      setIdPeriodoAcademico(periodoActual.idPeriodoAcademico.toString());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!idBeca) {
      toast.error("Selecciona una beca del catálogo");
      return;
    }

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
      await asignarBecaDesdeCatalogo({
        idEstudiante,
        idBeca: parseInt(idBeca),
        idPeriodoAcademico: usarPeriodo ? parseInt(idPeriodoAcademico) : null,
        vigenciaDesde: usarPeriodo ? periodoSeleccionado!.fechaInicio : vigenciaDesde,
        vigenciaHasta: usarPeriodo ? periodoSeleccionado!.fechaFin : (vigenciaHasta || null),
        observaciones: observaciones.trim() || null,
      });

      toast.success("Beca asignada exitosamente");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error al asignar beca"
      );
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar Beca</DialogTitle>
          <DialogDescription>
            Selecciona una beca del catálogo para asignar al estudiante
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beca">Tipo de Beca</Label>
            {loadingCatalogo ? (
              <div className="text-sm text-muted-foreground">
                Cargando catálogo...
              </div>
            ) : catalogoBecas.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay becas disponibles en el catálogo.
                <br />
                <Link
                  href="/dashboard/scholarships/catalog"
                  className="text-primary underline"
                >
                  Ir al catálogo de becas
                </Link>
              </div>
            ) : (
              <Select value={idBeca} onValueChange={setIdBeca}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una beca..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogoBecas.map((beca) => (
                    <SelectItem key={beca.idBeca} value={beca.idBeca.toString()}>
                      {beca.clave} - {beca.nombre} (
                      {beca.tipo === "PORCENTAJE"
                        ? `${beca.valor}%`
                        : `$${beca.valor.toLocaleString("es-MX")}`}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {becaSeleccionada && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="font-medium">{becaSeleccionada.nombre}</div>
              {becaSeleccionada.descripcion && (
                <div className="text-sm text-muted-foreground">
                  {becaSeleccionada.descripcion}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">Descuento: </span>
                {becaSeleccionada.tipo === "PORCENTAJE"
                  ? `${becaSeleccionada.valor}%`
                  : `$${becaSeleccionada.valor.toLocaleString("es-MX")}`}
                {becaSeleccionada.topeMensual && (
                  <span className="text-muted-foreground">
                    {" "}
                    (Tope: ${becaSeleccionada.topeMensual.toLocaleString("es-MX")})
                  </span>
                )}
              </div>
              {becaSeleccionada.conceptoPago && (
                <div className="text-sm">
                  <span className="font-medium">Aplica a: </span>
                  {becaSeleccionada.conceptoPago.nombre}
                </div>
              )}
            </div>
          )}
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
              placeholder="Ej: Beca otorgada por convenio con empresa X"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !idBeca ||
                catalogoBecas.length === 0 ||
                (usarPeriodo && !idPeriodoAcademico)
              }
            >
              {loading ? "Asignando..." : "Asignar Beca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
