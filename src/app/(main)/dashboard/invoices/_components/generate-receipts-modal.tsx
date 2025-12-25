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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { generateReceipts } from "@/services/receipts-service";
import { EmissionStrategy } from "@/types/receipt";

interface GenerateReceiptsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  idEstudiante?: number;
  idPeriodoAcademico?: number;
}

export function GenerateReceiptsModal({
  open,
  onOpenChange,
  onSuccess,
  idEstudiante,
  idPeriodoAcademico,
}: GenerateReceiptsModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    idEstudiante: idEstudiante ?? 0,
    idPeriodoAcademico: idPeriodoAcademico ?? 0,
    idPlanPago: null as number | null,
    estrategia: EmissionStrategy.MENSUAL,
    diaVencimiento: 5,
    aplicarBecas: true,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        idEstudiante: idEstudiante ?? 0,
        idPeriodoAcademico: idPeriodoAcademico ?? 0,
        idPlanPago: null,
        estrategia: EmissionStrategy.MENSUAL,
        diaVencimiento: 5,
        aplicarBecas: true,
      });
    }
  }, [open, idEstudiante, idPeriodoAcademico]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.idEstudiante === 0) {
      toast.error("Debes seleccionar un estudiante");
      return;
    }

    if (formData.idPeriodoAcademico === 0) {
      toast.error("Debes seleccionar un periodo académico");
      return;
    }

    setLoading(true);

    try {
      const receipts = await generateReceipts(formData);
      toast.success(`Se generaron ${receipts.length} recibos exitosamente`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating receipts:", error);
      toast.error("Error al generar los recibos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Generar Recibos</DialogTitle>
            <DialogDescription>Genera recibos de cobro para un estudiante</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="idEstudiante">ID Estudiante</Label>
              <Input
                id="idEstudiante"
                type="number"
                value={formData.idEstudiante}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idEstudiante: parseInt(e.target.value),
                  })
                }
                required
                disabled={!!idEstudiante}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="idPeriodoAcademico">ID Periodo Académico</Label>
              <Input
                id="idPeriodoAcademico"
                type="number"
                value={formData.idPeriodoAcademico}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idPeriodoAcademico: parseInt(e.target.value),
                  })
                }
                required
                disabled={!!idPeriodoAcademico}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estrategia">Estrategia de Emisión</Label>
              <Select
                value={formData.estrategia.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    estrategia: parseInt(value) as EmissionStrategy,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estrategia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmissionStrategy.MENSUAL.toString()}>Mensual</SelectItem>
                  <SelectItem value={EmissionStrategy.UNICO.toString()}>Único</SelectItem>
                  <SelectItem value={EmissionStrategy.PERSONALIZADO.toString()}>Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diaVencimiento">Día de Vencimiento</Label>
              <Input
                id="diaVencimiento"
                type="number"
                min="1"
                max="31"
                value={formData.diaVencimiento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    diaVencimiento: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="aplicarBecas"
                checked={formData.aplicarBecas}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    aplicarBecas: checked,
                  })
                }
              />
              <Label htmlFor="aplicarBecas" className="cursor-pointer">
                Aplicar becas y descuentos
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Generando..." : "Generar Recibos"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
