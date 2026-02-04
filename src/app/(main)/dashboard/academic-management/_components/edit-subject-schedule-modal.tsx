"use client";

import { useEffect, useState } from "react";

import { Clock, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { HorarioMateria, GrupoMateria } from "@/types/group";

import { SchedulePicker } from "./schedule-picker";

interface EditSubjectScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: GrupoMateria | null;
  onSuccess: () => void;
}

export function EditSubjectScheduleModal({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: EditSubjectScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [horarios, setHorarios] = useState<HorarioMateria[]>([]);

  useEffect(() => {
    if (open && subject) {
      setHorarios(subject.horarioJson || []);
    }
    if (!open) {
      setHorarios([]);
    }
  }, [open, subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject) return;

    if (horarios.length === 0) {
      toast.error("Agrega al menos un horario para la materia");
      return;
    }

    setLoading(true);
    try {
      const { updateSubjectSchedule } = await import("@/services/groups-service");
      await updateSubjectSchedule(subject.idGrupoMateria, horarios);

      toast.success("Horarios actualizados correctamente");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error updating schedule:", error);
      const err = error as { response?: { data?: { mensaje?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.mensaje ?? err?.message ?? "Error al actualizar los horarios";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!subject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Editar Horarios - {subject.nombreMateria}
          </DialogTitle>
          <DialogDescription>
            Modifica los horarios de clase para esta materia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-900">
              <strong>Materia:</strong> {subject.claveMateria} - {subject.nombreMateria}
            </p>
            <p className="text-blue-900 mt-1">
              <strong>Aula:</strong> {subject.aula || "No asignada"}
            </p>
          </div>

          <div className="border-t pt-4">
            <SchedulePicker
              value={horarios}
              onChange={setHorarios}
              aulaDefault={subject.aula || ""}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || horarios.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
