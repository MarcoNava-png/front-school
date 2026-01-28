"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { toast } from "sonner";

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
import { BecaCatalogo } from "@/types/receipt";

interface Props {
  open: boolean;
  onClose: () => void;
  idEstudiante: number;
}

export function AsignarBecaModal({ open, onClose, idEstudiante }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [catalogoBecas, setCatalogoBecas] = useState<BecaCatalogo[]>([]);

  // Form state
  const [idBeca, setIdBeca] = useState<string>("");
  const [vigenciaDesde, setVigenciaDesde] = useState("");
  const [vigenciaHasta, setVigenciaHasta] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Beca seleccionada para mostrar información
  const becaSeleccionada = catalogoBecas.find(
    (b) => b.idBeca.toString() === idBeca
  );

  useEffect(() => {
    if (open) {
      cargarCatalogo();
      // Set default vigencia desde to today
      const today = new Date().toISOString().split("T")[0];
      setVigenciaDesde(today);
    }
  }, [open]);

  async function cargarCatalogo() {
    setLoadingCatalogo(true);
    try {
      const data = await obtenerCatalogoBecas(true); // Solo activas
      setCatalogoBecas(data);
    } catch (error) {
      toast.error("Error al cargar catálogo de becas");
      console.error(error);
    } finally {
      setLoadingCatalogo(false);
    }
  }

  function resetForm() {
    setIdBeca("");
    setVigenciaDesde(new Date().toISOString().split("T")[0]);
    setVigenciaHasta("");
    setObservaciones("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validaciones
    if (!idBeca) {
      toast.error("Selecciona una beca del catálogo");
      return;
    }

    if (!vigenciaDesde) {
      toast.error("La fecha de inicio es requerida");
      return;
    }

    if (vigenciaHasta && new Date(vigenciaHasta) < new Date(vigenciaDesde)) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setLoading(true);

    try {
      await asignarBecaDesdeCatalogo({
        idEstudiante,
        idBeca: parseInt(idBeca),
        vigenciaDesde,
        vigenciaHasta: vigenciaHasta || null,
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

          {/* Información de la beca seleccionada */}
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
              disabled={loading || !idBeca || catalogoBecas.length === 0}
            >
              {loading ? "Asignando..." : "Asignar Beca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
