"use client";

import { useState, useEffect } from "react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  crearConceptoPago,
  actualizarConceptoPago,
  CreateConceptoPagoDto,
} from "@/services/conceptos-pago-service";
import { ConceptoPago } from "@/types/receipt";

interface Props {
  open: boolean;
  onClose: (shouldReload?: boolean) => void;
  conceptoToEdit?: ConceptoPago | null;
}

export function CreateConceptModal({ open, onClose, conceptoToEdit }: Props) {
  const [loading, setLoading] = useState(false);

  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<CreateConceptoPagoDto["tipo"]>("COLEGIATURA");
  const [permiteBeca, setPermiteBeca] = useState(true);

  const isEditing = !!conceptoToEdit;

  const tiposConcepto: CreateConceptoPagoDto["tipo"][] = [
    "INSCRIPCION",
    "COLEGIATURA",
    "EXAMEN",
    "CONSTANCIA",
    "CREDENCIAL",
    "SEGURO",
    "OTRO",
  ];

  useEffect(() => {
    if (conceptoToEdit) {
      setClave(conceptoToEdit.clave || "");
      setNombre(conceptoToEdit.nombre || "");
      setDescripcion(conceptoToEdit.descripcion || "");
      setTipo(conceptoToEdit.tipo || "COLEGIATURA");
      setPermiteBeca(conceptoToEdit.permiteBeca ?? true);
    } else {
      resetForm();
    }
  }, [conceptoToEdit]);

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

    setLoading(true);

    try {
      if (isEditing) {
        await actualizarConceptoPago(conceptoToEdit.idConceptoPago, {
          nombre,
          descripcion: descripcion || undefined,
          tipo,
          permiteBeca,
        });
        toast.success("Concepto actualizado exitosamente");
      } else {
        const dto: CreateConceptoPagoDto = {
          clave,
          nombre,
          descripcion: descripcion || undefined,
          tipo,
          permiteBeca,
        };

        await crearConceptoPago(dto);
        toast.success("Concepto creado exitosamente");
      }

      onClose(true);
      resetForm();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        `Error al ${isEditing ? "actualizar" : "crear"} concepto`
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setClave("");
    setNombre("");
    setDescripcion("");
    setTipo("COLEGIATURA");
    setPermiteBeca(true);
  }

  function handleDialogChange(open: boolean) {
    if (!open) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Concepto de Pago" : "Nuevo Concepto de Pago"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del concepto de pago"
              : "Registra un nuevo concepto de cobro en el sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clave">
                Clave <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clave"
                value={clave || ""}
                onChange={(e) => setClave(e.target.value.toUpperCase())}
                placeholder="Ej: INSC-2024"
                disabled={isEditing}
                maxLength={20}
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  La clave no se puede modificar
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de Concepto <span className="text-red-500">*</span>
              </Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposConcepto.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={nombre || ""}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Inscripción Cuatrimestral"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion || ""}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional del concepto..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="permite-beca" className="text-base">
                Permite Beca
              </Label>
              <p className="text-sm text-muted-foreground">
                Indica si este concepto puede tener descuentos por becas
              </p>
            </div>
            <Switch
              id="permite-beca"
              checked={permiteBeca}
              onCheckedChange={setPermiteBeca}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2">Tipos de Concepto:</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li><strong>INSCRIPCION:</strong> Pago inicial de inscripción al programa</li>
              <li><strong>COLEGIATURA:</strong> Pago recurrente de mensualidad o colegiatura</li>
              <li><strong>EXAMEN:</strong> Pago por examen extraordinario o de admisión</li>
              <li><strong>CONSTANCIA:</strong> Emisión de documentos oficiales</li>
              <li><strong>CREDENCIAL:</strong> Emisión o reposición de credencial</li>
              <li><strong>SEGURO:</strong> Seguro escolar o de vida</li>
              <li><strong>OTRO:</strong> Otros conceptos no clasificados</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? "Actualizando..."
                  : "Creando..."
                : isEditing
                ? "Actualizar Concepto"
                : "Crear Concepto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
