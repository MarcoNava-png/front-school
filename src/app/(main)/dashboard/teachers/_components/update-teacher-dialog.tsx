"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMunicipalities, getTownships } from "@/services/location-service";
import { updateTeacher } from "@/services/teacher-service";
import { CivilStatus, Genres } from "@/types/catalog";
import { State, Municipality, Township } from "@/types/location";
import { Teacher } from "@/types/teacher";

export interface UpdateTeacherDialogProps {
  open: boolean;
  teacher: Teacher | null;
  campusId?: number | null;
  genres: Genres[];
  states: State[];
  civilStatus: CivilStatus[];
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export const UpdateTeacherDialog: React.FC<UpdateTeacherDialogProps> = ({
  open,
  teacher,
  campusId,
  genres,
  states,
  civilStatus,
  onClose,
  onUpdate,
}) => {
  const [form, setForm] = React.useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    generoId: 0,
    correo: "",
    telefono: "",
    curp: "",
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    codigoPostalId: "",
    idEstadoCivil: 0,
    noEmpleado: "",
    rfc: "",
    emailInstitucional: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedState, setSelectedState] = React.useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = React.useState<string>("");
  const [municipalities, setMunicipalities] = React.useState<Municipality[]>([]);
  const [townships, setTownships] = React.useState<Township[]>([]);

  React.useEffect(() => {
    setSelectedMunicipality("");
    setTownships([]);
    setForm((prev) => ({ ...prev, codigoPostalId: "" }));
    if (selectedState) {
      getMunicipalities(selectedState)
        .then((data) => setMunicipalities(data))
        .catch(() => setMunicipalities([]));
    } else {
      setMunicipalities([]);
    }
  }, [selectedState]);

  React.useEffect(() => {
    setTownships([]);
    setForm((prev) => ({ ...prev, codigoPostalId: "" }));
    if (selectedMunicipality) {
      getTownships(selectedMunicipality)
        .then((data) => setTownships(data))
        .catch(() => setTownships([]));
    } else {
      setTownships([]);
    }
  }, [selectedMunicipality]);

  React.useEffect(() => {
    if (open && teacher) {
      setForm({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNacimiento: "",
        generoId: 0,
        correo: "",
        telefono: "",
        curp: "",
        calle: "",
        numeroExterior: "",
        numeroInterior: "",
        codigoPostalId: "",
        idEstadoCivil: 0,
        noEmpleado: teacher.noEmpleado || "",
        rfc: "",
        emailInstitucional: teacher.emailInstitucional || "",
      });
      setSelectedState("");
      setSelectedMunicipality("");
      setError(null);
    }
  }, [open, teacher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!campusId || !teacher) {
      setError("No se ha seleccionado un campus o profesor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        idProfesor: teacher.idProfesor,
        generoId: Number(form.generoId),
        codigoPostalId: Number(form.codigoPostalId),
        idEstadoCivil: Number(form.idEstadoCivil),
        campusId: campusId,
        status: 1,
      };

      await updateTeacher(payload);
      onUpdate(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al actualizar el profesor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Actualizar Profesor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          {/* Apellido paterno */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
            <Input
              id="apellidoPaterno"
              name="apellidoPaterno"
              value={form.apellidoPaterno}
              onChange={handleChange}
              required
            />
          </div>

          {/* Apellido materno */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="apellidoMaterno">Apellido materno</Label>
            <Input
              id="apellidoMaterno"
              name="apellidoMaterno"
              value={form.apellidoMaterno}
              onChange={handleChange}
              required
            />
          </div>

          {/* Fecha nacimiento */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              required
            />
          </div>

          {/* Género */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="generoId">Género</Label>
            <select
              id="generoId"
              name="generoId"
              value={form.generoId}
              onChange={handleChange}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value={0} disabled>
                Selecciona género
              </option>
              {genres.map((g) => (
                <option key={g.idGenero} value={g.idGenero}>
                  {g.descGenero}
                </option>
              ))}
            </select>
          </div>

          {/* Correo personal */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="correo">Correo personal</Label>
            <Input id="correo" type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} required />
          </div>

          {/* CURP */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="curp">CURP</Label>
            <Input id="curp" name="curp" value={form.curp} onChange={handleChange} required />
          </div>

          {/* Calle */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="calle">Calle</Label>
            <Input id="calle" name="calle" value={form.calle} onChange={handleChange} required />
          </div>

          {/* Número exterior */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="numeroExterior">Número exterior</Label>
            <Input
              id="numeroExterior"
              name="numeroExterior"
              value={form.numeroExterior}
              onChange={handleChange}
              required
            />
          </div>

          {/* Número interior */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="numeroInterior">Número interior</Label>
            <Input id="numeroInterior" name="numeroInterior" value={form.numeroInterior} onChange={handleChange} />
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="state">Estado</Label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>
                Selecciona estado
              </option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Municipio */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="municipality">Municipio</Label>
            <select
              id="municipality"
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={!selectedState}
            >
              <option value="" disabled>
                Selecciona municipio
              </option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Colonia / Código postal */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="codigoPostalId">Colonia / Código postal</Label>
            <select
              id="codigoPostalId"
              name="codigoPostalId"
              value={form.codigoPostalId}
              onChange={(e) => setForm((prev) => ({ ...prev, codigoPostalId: e.target.value }))}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={!selectedMunicipality}
            >
              <option value="" disabled>
                Selecciona colonia / código postal
              </option>
              {townships.map((t) => (
                <option key={t.id} value={t.codigo}>
                  {t.asentamiento} ({t.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Estado civil */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="idEstadoCivil">Estado civil</Label>
            <select
              id="idEstadoCivil"
              name="idEstadoCivil"
              value={form.idEstadoCivil}
              onChange={handleChange}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value={0} disabled>
                Selecciona estado civil
              </option>
              {civilStatus.map((c) => (
                <option key={c.idEstadoCivil} value={c.idEstadoCivil}>
                  {c.descEstadoCivil}
                </option>
              ))}
            </select>
          </div>

          {/* No. Empleado */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="noEmpleado">No. Empleado</Label>
            <Input id="noEmpleado" name="noEmpleado" value={form.noEmpleado} onChange={handleChange} required />
          </div>

          {/* RFC */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input id="rfc" name="rfc" value={form.rfc} onChange={handleChange} required />
          </div>

          {/* Email institucional */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="emailInstitucional">Email institucional</Label>
            <Input
              id="emailInstitucional"
              type="email"
              name="emailInstitucional"
              value={form.emailInstitucional}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="text-destructive col-span-2 text-sm">{error}</div>}

          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" onClick={onClose} variant="secondary" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
