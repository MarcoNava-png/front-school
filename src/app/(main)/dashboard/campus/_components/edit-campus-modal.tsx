import React from "react";

import { updateCampus } from "@/services/campus-service";
import { getMunicipalities, getTownships } from "@/services/location-service";
import { Campus } from "@/types/campus";
import { State, Municipality, Township } from "@/types/location";

import { Button } from "../../../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";

interface EditCampusModalProps {
  open: boolean;
  campus: Campus;
  states: State[];
  onClose: () => void;
  onUpdate: (data: Campus) => void;
}

export const EditCampusModal: React.FC<EditCampusModalProps> = ({ open, campus, states, onClose, onUpdate }) => {
  const [claveCampus, setClaveCampus] = React.useState(campus.claveCampus || "");
  const [nombre, setNombre] = React.useState(campus.nombre || "");
  const [calle, setCalle] = React.useState(campus.direccion || "");
  const [numeroExterior, setNumeroExterior] = React.useState("");
  const [numeroInterior, setNumeroInterior] = React.useState("");
  const [codigoPostalId, setCodigoPostalId] = React.useState("");
  const [selectedState, setSelectedState] = React.useState("");
  const [selectedMunicipality, setSelectedMunicipality] = React.useState("");
  const [municipalities, setMunicipalities] = React.useState<Municipality[]>([]);
  const [townships, setTownships] = React.useState<Township[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (selectedState) {
      getMunicipalities(selectedState).then(setMunicipalities);
    }
  }, [selectedState]);

  React.useEffect(() => {
    if (selectedMunicipality) {
      getTownships(selectedMunicipality).then(setTownships);
    }
  }, [selectedMunicipality]);

  const validate = () => {
    if (!claveCampus.trim()) return "La clave es obligatoria";
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!calle.trim()) return "La calle es obligatoria";
    if (!numeroExterior.trim()) return "El número exterior es obligatorio";
    if (!numeroInterior.trim()) return "El número interior es obligatorio";
    if (!selectedState) return "El estado es obligatorio";
    if (!selectedMunicipality) return "El municipio es obligatorio";
    if (!codigoPostalId.trim() || isNaN(Number(codigoPostalId))) return "La localidad es obligatoria";
    return null;
  };

  const handleUpdate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...campus,
        claveCampus: claveCampus.trim(),
        nombre: nombre.trim(),
        calle: calle.trim(),
        direccion: calle.trim(),
        numeroExterior: numeroExterior.trim(),
        numeroInterior: numeroInterior.trim(),
        codigoPostalId: Number(codigoPostalId),
        status: 1,
      };
      const updatedCampus = await updateCampus(payload);
      onUpdate(updatedCampus);
      onClose();
    } catch {
      setError("Error al actualizar campus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar campus</DialogTitle>
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
          <label className="text-sm font-medium">Estado</label>
          <select
            className="block w-full rounded border px-3 py-2"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Selecciona estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.nombre}
              </option>
            ))}
          </select>
          <label className="text-sm font-medium">Municipio</label>
          <select
            className="block w-full rounded border px-3 py-2"
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Selecciona municipio</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <label className="text-sm font-medium">Localidad/Colonia</label>
          <select
            className="block w-full rounded border px-3 py-2"
            value={codigoPostalId}
            onChange={(e) => setCodigoPostalId(e.target.value)}
            disabled={!selectedMunicipality}
          >
            <option value="">Selecciona localidad/colonia</option>
            {townships.map((t) => (
              <option key={t.id} value={t.id}>
                {t.asentamiento} ({t.codigo})
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
