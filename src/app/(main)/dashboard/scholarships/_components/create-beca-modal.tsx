"use client";

import { useState } from "react";

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
import { crearBeca } from "@/services/becas-service";
import { CreateBecaEstudianteDto } from "@/types/receipt";

interface Props {
  open: boolean;
  onClose: () => void;
  idEstudiante: number;
}

export function CreateBecaModal({ open, onClose, idEstudiante }: Props) {
  const [loading, setLoading] = useState(false);

  const [tipoBeca, setTipoBeca] = useState<"PORCENTAJE" | "MONTO">("PORCENTAJE");
  const [valor, setValor] = useState("");
  const [vigenciaDesde, setVigenciaDesde] = useState(new Date().toISOString().split("T")[0]);
  const [vigenciaHasta, setVigenciaHasta] = useState("");
  const [observaciones, setObservaciones] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!valor || parseFloat(valor) <= 0) {
      toast.error("Ingresa un valor válido");
      return;
    }

    if (tipoBeca === "PORCENTAJE" && parseFloat(valor) > 100) {
      toast.error("El porcentaje no puede ser mayor a 100");
      return;
    }

    if (!vigenciaDesde) {
      toast.error("Ingresa la fecha de inicio");
      return;
    }

    setLoading(true);

    try {
      const dto: CreateBecaEstudianteDto = {
        idEstudiante,
        tipoBeca,
        valor: parseFloat(valor),
        idConceptoPago: null,
        vigenciaDesde,
        vigenciaHasta: vigenciaHasta || null,
        observaciones,
      };

      await crearBeca(dto);
      toast.success("Beca creada exitosamente");
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear beca");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTipoBeca("PORCENTAJE");
    setValor("");
    setVigenciaDesde(new Date().toISOString().split("T")[0]);
    setVigenciaHasta("");
    setObservaciones("");
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Beca</DialogTitle>
          <DialogDescription>
            Asigna un descuento por porcentaje o monto fijo al estudiante
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Beca</Label>
            <Select value={tipoBeca} onValueChange={(v: any) => setTipoBeca(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
                <SelectItem value="MONTO">Monto Fijo ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">
              {tipoBeca === "PORCENTAJE" ? "Porcentaje de Descuento" : "Monto de Descuento"}
            </Label>
            <div className="relative">
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                max={tipoBeca === "PORCENTAJE" ? "100" : undefined}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder={tipoBeca === "PORCENTAJE" ? "Ej: 50" : "Ej: 1500.00"}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {tipoBeca === "PORCENTAJE" ? "%" : "$"}
              </div>
            </div>
            {tipoBeca === "PORCENTAJE" && (
              <p className="text-xs text-muted-foreground">
                Se aplicará el {valor || 0}% de descuento en los conceptos del estudiante
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inicio">Fecha de Inicio</Label>
              <Input
                id="inicio"
                type="date"
                value={vigenciaDesde}
                onChange={(e) => setVigenciaDesde(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fin">Fecha de Fin (Opcional)</Label>
              <Input
                id="fin"
                type="date"
                value={vigenciaHasta}
                onChange={(e) => setVigenciaHasta(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Beca por excelencia académica"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Beca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
