import React from "react";

import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createStudent } from "@/services/students-service";
import { Applicant } from "@/types/applicant";
import { StudyPlan } from "@/types/study-plan";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";

interface AssignStudentModalProps {
  open: boolean;
  applicant: Applicant;
  studyPlans: StudyPlan[];
  onClose: () => void;
  onAssign: (studentData: any) => void;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  open,
  applicant,
  studyPlans = [],
  onClose,
  onAssign,
}) => {
  const [matricula, setMatricula] = React.useState("");
  const [fechaIngreso, setFechaIngreso] = React.useState("");
  const [idPlanActual, setIdPlanActual] = React.useState("");
  const [activo, setActivo] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAssign = async () => {
    if (!matricula.trim()) {
      setError("La matrícula es obligatoria");
      return;
    }
    if (!fechaIngreso.trim()) {
      setError("La fecha de ingreso es obligatoria");
      return;
    }
    if (!idPlanActual) {
      setError("El plan de estudios es obligatorio");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        matricula: matricula.trim(),
        idPersona: applicant.personaId,
        fechaIngreso: fechaIngreso,
        idPlanActual: Number(idPlanActual),
        activo,
      };
      const student = await createStudent(payload);
      toast.success("Estudiante asignado correctamente");
      onAssign(student);
      onClose();
    } catch {
      setError("Error al asignar estudiante");
      toast.error("Error al asignar estudiante", { description: "Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar estudiante</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {error && <div className="text-destructive mb-2 text-sm">{error}</div>}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Matrícula del estudiante</label>
            <Input
              placeholder="Matrícula del estudiante"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Fecha de ingreso</label>
            <Input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Plan de estudios</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={idPlanActual}
              onChange={(e) => setIdPlanActual(e.target.value)}
            >
              <option value="">Selecciona plan de estudios</option>
              {studyPlans.map((plan) => (
                <option key={plan.idPlanEstudios} value={plan.idPlanEstudios}>
                  {plan.nombrePlanEstudios}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            <label className="text-sm font-medium">Activo</label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
