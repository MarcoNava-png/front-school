import React from "react";

import { createCampus } from "@/services/campus-service";
import { getMunicipalities, getTownships } from "@/services/location-service";
import { Campus } from "@/types/campus";
import { State, Municipality, Township } from "@/types/location";

import { Button } from "../../../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";

interface CreateCampusModalProps {
  open: boolean;
  states: State[];
  onClose: () => void;
  onCreate: (data: Campus) => void;
}

export const CreateCampusModal: React.FC<CreateCampusModalProps> = ({ open, states, onClose, onCreate }) => {
  const [claveCampus, setClaveCampus] = React.useState("");
  const [nombre, setNombre] = React.useState("");
  const [calle, setCalle] = React.useState("");
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
      setSelectedMunicipality("");
      setTownships([]);
      setCodigoPostalId("");
    } else {
      setMunicipalities([]);
      setSelectedMunicipality("");
      setTownships([]);
      setCodigoPostalId("");
    }
  }, [selectedState]);

  React.useEffect(() => {
    if (selectedMunicipality) {
      getTownships(selectedMunicipality).then(setTownships);
      setCodigoPostalId("");
    } else {
      setTownships([]);
      setCodigoPostalId("");
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
    } catch {
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

          <label className="text-sm font-medium">Estado</label>
          <select
            className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
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
            className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
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
            className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
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
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
