import React from "react";

import { createCampus } from "@/services/campus-service";
import { Campus } from "@/types/campus";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";

interface CreateCampusModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Campus) => void;
}

export const CreateCampusModal: React.FC<CreateCampusModalProps> = ({ open, onClose, onCreate }) => {
  const [claveCampus, setClaveCampus] = React.useState("");
  const [nombre, setNombre] = React.useState("");
  const [calle, setCalle] = React.useState("");
  const [numeroExterior, setNumeroExterior] = React.useState("");
  const [numeroInterior, setNumeroInterior] = React.useState("");
  const [codigoPostalId, setCodigoPostalId] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const validate = () => {
    if (!claveCampus.trim()) return "La clave es obligatoria";
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!calle.trim()) return "La calle es obligatoria";
    if (!numeroExterior.trim()) return "El número exterior es obligatorio";
    if (!numeroInterior.trim()) return "El número interior es obligatorio";
    if (!codigoPostalId.trim() || isNaN(Number(codigoPostalId))) return "El código postal debe ser un número";
    return null;
  };

  const handleCreate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        claveCampus: claveCampus.trim(),
        nombre: nombre.trim(),
        calle: calle.trim(),
        numeroExterior: numeroExterior.trim(),
        numeroInterior: numeroInterior.trim(),
        codigoPostalId: Number(codigoPostalId),
      };
      const campus = await createCampus(payload);
      setClaveCampus("");
      setNombre("");
      setCalle("");
      setNumeroExterior("");
      setNumeroInterior("");
      setCodigoPostalId("");
      onCreate(campus);
      onClose();
    } catch (err) {
      setError("Error al crear campus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="create-applicant-description" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Crear campus</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {error && <div className="text-destructive mb-2 text-sm">{error}</div>}
          <Input placeholder="Clave del campus" value={claveCampus} onChange={(e) => setClaveCampus(e.target.value)} />
          <Input placeholder="Nombre del campus" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input placeholder="Calle" value={calle} onChange={(e) => setCalle(e.target.value)} />
          <Input
            placeholder="Número exterior"
            value={numeroExterior}
            onChange={(e) => setNumeroExterior(e.target.value)}
          />
          <Input
            placeholder="Número interior"
            value={numeroInterior}
            onChange={(e) => setNumeroInterior(e.target.value)}
          />
          <Input
            placeholder="Código postal ID"
            type="number"
            value={codigoPostalId}
            onChange={(e) => setCodigoPostalId(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
