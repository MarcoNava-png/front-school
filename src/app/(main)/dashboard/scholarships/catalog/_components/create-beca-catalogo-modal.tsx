"use client";

import { useEffect, useState } from "react";

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
import {
  actualizarBecaCatalogo,
  crearBecaCatalogo,
} from "@/services/beca-catalogo-service";
import { BecaCatalogo } from "@/types/receipt";

interface Props {
  open: boolean;
  onClose: (shouldReload?: boolean) => void;
  becaToEdit?: BecaCatalogo | null;
}

export function CreateBecaCatalogoModal({ open, onClose, becaToEdit }: Props) {
  const [loading, setLoading] = useState(false);

  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"PORCENTAJE" | "MONTO">("PORCENTAJE");
  const [valor, setValor] = useState("");
  const [topeMensual, setTopeMensual] = useState("");

  const isEditing = !!becaToEdit;

  useEffect(() => {
    if (becaToEdit) {
      setClave(becaToEdit.clave);
      setNombre(becaToEdit.nombre);
      setDescripcion(becaToEdit.descripcion || "");
      setTipo(becaToEdit.tipo);
      setValor(becaToEdit.valor.toString());
      setTopeMensual(becaToEdit.topeMensual?.toString() || "");
    } else {
      resetForm();
    }
  }, [becaToEdit, open]);

  function resetForm() {
    setClave("");
    setNombre("");
    setDescripcion("");
    setTipo("PORCENTAJE");
    setValor("");
    setTopeMensual("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clave.trim()) {
      toast.error("La clave es requerida");
      return;
    }

    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!valor || parseFloat(valor) <= 0) {
      toast.error("Ingresa un valor válido");
      return;
    }

    if (tipo === "PORCENTAJE" && parseFloat(valor) > 100) {
      toast.error("El porcentaje no puede ser mayor a 100");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && becaToEdit) {
        await actualizarBecaCatalogo(becaToEdit.idBeca, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          tipo,
          valor: parseFloat(valor),
          topeMensual: topeMensual ? parseFloat(topeMensual) : null,
          idConceptoPago: null,
          activo: becaToEdit.activo,
        });
        toast.success("Beca actualizada exitosamente");
      } else {
        await crearBecaCatalogo({
          clave: clave.trim().toUpperCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          tipo,
          valor: parseFloat(valor),
          topeMensual: topeMensual ? parseFloat(topeMensual) : null,
          idConceptoPago: null,
        });
        toast.success("Beca creada exitosamente");
      }
      onClose(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al guardar beca");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Beca" : "Nueva Beca"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la beca"
              : "Define un nuevo tipo de beca para el catálogo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clave">Clave</Label>
              <Input
                id="clave"
                value={clave}
                onChange={(e) => setClave(e.target.value.toUpperCase())}
                placeholder="Ej: BEA-50"
                disabled={isEditing}
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                Identificador único de la beca
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Descuento</Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
                  <SelectItem value="MONTO">Monto Fijo ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Beca Excelencia Académica 50%"
              maxLength={150}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Beca para estudiantes con promedio mayor a 9.0"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">
                {tipo === "PORCENTAJE" ? "Porcentaje de Descuento" : "Monto de Descuento"}
              </Label>
              <div className="relative">
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  max={tipo === "PORCENTAJE" ? "100" : undefined}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder={tipo === "PORCENTAJE" ? "Ej: 50" : "Ej: 1500.00"}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {tipo === "PORCENTAJE" ? "%" : "$"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tope">Tope Mensual (Opcional)</Label>
              <div className="relative">
                <Input
                  id="tope"
                  type="number"
                  step="0.01"
                  min="0"
                  value={topeMensual}
                  onChange={(e) => setTopeMensual(e.target.value)}
                  placeholder="Ej: 500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Límite máximo de descuento por mes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Beca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
