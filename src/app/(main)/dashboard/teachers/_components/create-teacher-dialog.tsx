"use client";

import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Search, User, MapPin, Briefcase, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getMunicipalities, getTownships } from "@/services/location-service";
import { createTeacher } from "@/services/teacher-service";
import { CivilStatus, Genres } from "@/types/catalog";
import { State, Municipality, Township } from "@/types/location";

const createTeacherSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidoPaterno: z.string().min(2, "El apellido paterno debe tener al menos 2 caracteres"),
  apellidoMaterno: z.string().min(2, "El apellido materno debe tener al menos 2 caracteres"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  generoId: z.number().min(1, "Selecciona un género"),
  idEstadoCivil: z.number().min(1, "Selecciona un estado civil"),
  curp: z.string().length(18, "El CURP debe tener 18 caracteres"),
  correo: z.string().email("Ingresa un correo válido"),
  telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  emailInstitucional: z.string().email("Ingresa un correo institucional válido"),
  calle: z.string().min(1, "La calle es requerida"),
  numeroExterior: z.string().min(1, "El número exterior es requerido"),
  numeroInterior: z.string().optional(),
  stateId: z.string().min(1, "Selecciona un estado"),
  municipalityId: z.string().min(1, "Selecciona un municipio"),
  codigoPostalId: z.number().min(1, "Selecciona una colonia"),
  noEmpleado: z.string().min(1, "El número de empleado es requerido"),
  rfc: z.string().min(12, "El RFC debe tener al menos 12 caracteres").max(13, "El RFC no puede tener más de 13 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;

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
  const [loading, setLoading] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [townships, setTownships] = useState<Township[]>([]);
  const [openColoniaPopover, setOpenColoniaPopover] = useState(false);
  const [coloniaSearch, setColoniaSearch] = useState("");

  const form = useForm<CreateTeacherFormData>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: "",
      generoId: 0,
      idEstadoCivil: 0,
      curp: "",
      correo: "",
      telefono: "",
      emailInstitucional: "",
      calle: "",
      numeroExterior: "",
      numeroInterior: "",
      stateId: "",
      municipalityId: "",
      codigoPostalId: 0,
      noEmpleado: "",
      rfc: "",
      password: "",
    },
  });

  const watchedStateId = form.watch("stateId");
  const watchedMunicipalityId = form.watch("municipalityId");
  const watchedCodigoPostalId = form.watch("codigoPostalId");

  useEffect(() => {
    if (open) {
      form.reset();
      setMunicipalities([]);
      setTownships([]);
    }
  }, [open, form]);

  useEffect(() => {
    if (watchedStateId) {
      getMunicipalities(watchedStateId).then(setMunicipalities);
      form.setValue("municipalityId", "", { shouldValidate: false });
      form.setValue("codigoPostalId", 0, { shouldValidate: false });
    } else {
      setMunicipalities([]);
    }

  }, [watchedStateId]);

  useEffect(() => {
    if (watchedMunicipalityId) {
      getTownships(watchedMunicipalityId).then(setTownships);
      form.setValue("codigoPostalId", 0, { shouldValidate: false });
    } else {
      setTownships([]);
    }

  }, [watchedMunicipalityId]);

  const filteredTownships = useMemo(() => {
    return townships.filter((t) => t.municipioId === watchedMunicipalityId);
  }, [townships, watchedMunicipalityId]);

  const searchedTownships = useMemo(() => {
    if (!coloniaSearch) return filteredTownships;
    return filteredTownships.filter((t) =>
      t.asentamiento.toLowerCase().includes(coloniaSearch.toLowerCase())
    );
  }, [filteredTownships, coloniaSearch]);

  const selectedColoniaName = useMemo(() => {
    const found = townships.find((t) => t.id === watchedCodigoPostalId);
    return found?.asentamiento || "";
  }, [townships, watchedCodigoPostalId]);

  const onSubmit = async (data: CreateTeacherFormData) => {
    if (!campusId) {
      toast.error("No se ha seleccionado un campus");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        campusId: campusId,
      };

      await createTeacher(payload);
      toast.success("Profesor creado correctamente");
      onCreate(payload);
      onClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.response?.data || "Error al crear el profesor";
      toast.error("Error al crear profesor", { description: String(errorMessage) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] w-full !max-w-5xl overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-900">
            Nuevo Profesor
          </DialogTitle>
          <DialogDescription>
            Complete el formulario con la información del profesor. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sección: Datos Personales */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Datos Personales</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre(s)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apellidoPaterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Paterno <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido paterno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apellidoMaterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Materno <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido materno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona género" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre.idGenero} value={String(genre.idGenero)}>
                              {genre.descGenero}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idEstadoCivil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Civil <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado civil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {civilStatus.map((status) => (
                            <SelectItem key={status.idEstadoCivil} value={String(status.idEstadoCivil)}>
                              {status.descEstadoCivil}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="curp"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>CURP <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CURP (18 caracteres)"
                          maxLength={18}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Información de Contacto</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Personal <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="10 dígitos" maxLength={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailInstitucional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Institucional <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="profesor@universidad.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección: Dirección */}
            <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-900">Dirección</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="calle"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Calle <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la calle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroExterior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Exterior <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="No. ext" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroInterior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Interior</FormLabel>
                      <FormControl>
                        <Input placeholder="Opcional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.id}>
                              {state.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="municipalityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipio <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={!watchedStateId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona municipio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {municipalities
                            .filter((m) => m.estadoId === watchedStateId)
                            .map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.nombre}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buscador de Colonia */}
                <FormField
                  control={form.control}
                  name="codigoPostalId"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Colonia/Localidad <span className="text-red-500">*</span></FormLabel>
                      <Popover open={openColoniaPopover} onOpenChange={setOpenColoniaPopover}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={!watchedMunicipalityId}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Search className="h-4 w-4 shrink-0 opacity-50" />
                                <span className="truncate">
                                  {selectedColoniaName || "Buscar colonia..."}
                                </span>
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Escribe para buscar colonia..."
                              value={coloniaSearch}
                              onValueChange={setColoniaSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No se encontraron colonias</CommandEmpty>
                              <CommandGroup className="max-h-[300px] overflow-y-auto">
                                {searchedTownships.map((township) => (
                                  <CommandItem
                                    key={township.id}
                                    value={township.asentamiento}
                                    onSelect={() => {
                                      field.onChange(township.id);
                                      setOpenColoniaPopover(false);
                                      setColoniaSearch("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === township.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{township.asentamiento}</span>
                                      <span className="text-xs text-muted-foreground">
                                        CP: {township.codigo}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección: Información Laboral */}
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">Información Laboral</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="noEmpleado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Empleado <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Número de empleado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rfc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RFC <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="RFC (12-13 caracteres)"
                          maxLength={13}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Creando..." : "Crear Profesor"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
