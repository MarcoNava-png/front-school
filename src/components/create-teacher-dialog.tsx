import React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export interface CreateTeacherDialogProps {
  open: boolean;
  campusId?: number | null;
  onClose: () => void;
  onCreate: (data: any) => void;
}

export const CreateTeacherDialog: React.FC<CreateTeacherDialogProps> = ({ open, campusId, onClose, onCreate }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Profesor</DialogTitle>
        </DialogHeader>
        {/* Aquí va el formulario para crear un profesor */}
        <div className="flex flex-col gap-4 py-4">
          <input className="rounded border px-2 py-1" placeholder="Nombre" />
          <input className="rounded border px-2 py-1" placeholder="Correo" />
          {/* Agregar más campos según sea necesario */}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button type="button" onClick={() => onCreate({})}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
