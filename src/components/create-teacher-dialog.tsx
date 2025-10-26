"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeacher } from "@/services/teacher-service";
import { CivilStatus, Genres } from "@/types/catalog";
import { State } from "@/types/location";

export interface CreateTeacherDialogProps {
  open: boolean;
  campusId?: number | null;
  genres: Genres[];
  states: State[];
  civilStatus: CivilStatus[];
  onClose: () => void;
  onCreate: (data: any) => void;
}

export const CreateTeacherDialog: React.FC<CreateTeacherDialogProps> = ({
  open,
  campusId,
  genres,
  states,
  civilStatus,
  onClose,
  onCreate,
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
    codigoPostalId: 0,
    idEstadoCivil: 0,
    noEmpleado: "",
    rfc: "",
    emailInstitucional: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
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
        codigoPostalId: 0,
        idEstadoCivil: 0,
        noEmpleado: "",
        rfc: "",
        emailInstitucional: "",
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!campusId) {
      setError("No se ha seleccionado un campus");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        generoId: Number(form.generoId),
        codigoPostalId: Number(form.codigoPostalId),
        idEstadoCivil: Number(form.idEstadoCivil),
        campusId: campusId,
      };

      await createTeacher(payload);
      onCreate(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al crear el profesor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Profesor</DialogTitle>
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

          {/* Código postal */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="codigoPostalId">Código postal</Label>
            <Input
              id="codigoPostalId"
              type="number"
              name="codigoPostalId"
              value={form.codigoPostalId}
              onChange={handleChange}
              required
            />
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
              {loading ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
