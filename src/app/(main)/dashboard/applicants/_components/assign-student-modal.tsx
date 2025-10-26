import React from "react";

import { Button } from "../../../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";

interface AssignStudentModalProps {
  open: boolean;
  applicant: any;
  onClose: () => void;
  onAssign: (studentData: any) => void;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({ open, applicant, onClose, onAssign }) => {
  const [matricula, setMatricula] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAssign = async () => {
    if (!matricula.trim()) {
      setError("La matrícula es obligatoria");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Aquí deberías llamar a tu servicio para asignar el estudiante
      // Por ahora solo simula el resultado
      onAssign({
        idAspirante: applicant.idAspirante,
        matricula,
      });
      onClose();
    } catch (err) {
      setError("Error al asignar estudiante");
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
          <Input
            placeholder="Matrícula del estudiante"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
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
