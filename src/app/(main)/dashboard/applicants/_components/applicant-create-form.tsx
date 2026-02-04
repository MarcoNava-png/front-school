"use client";

import { useEffect, useState, useMemo } from "react";

import { Check, ChevronsUpDown, Search, User, MapPin, GraduationCap, Phone } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { getMunicipalities, getTownships } from "@/services/location-service";
import { PayloadCreateApplicant } from "@/types/applicant";
import { Campus } from "@/types/campus";
import {
  ApplicantStatus,
  CivilStatus,
  ContactMethod,
  Genres,
  Schedule,
} from "@/types/catalog";
import { State, Municipality, Township } from "@/types/location";
import { StudyPlan } from "@/types/study-plan";

interface ApplicantFormProps {
  form: UseFormReturn<PayloadCreateApplicant>;
  open: boolean;
  genres: Genres[];
  civilStatus: CivilStatus[];
  campus: Campus[];
  studyPlans: StudyPlan[];
  contactMethods: ContactMethod[];
  schedules: Schedule[];
  applicantStatus: ApplicantStatus[];
  states: State[];
  onSubmit: (data: PayloadCreateApplicant) => void;
  onCancel: () => void;
}

export function ApplicantCreateForm({
  form,
  genres,
  civilStatus,
  campus,
  studyPlans,
  contactMethods,
  schedules,
  applicantStatus,
  states,
  onSubmit,
  onCancel,
}: ApplicantFormProps) {
  const { user } = useCurrentUser();

  useEffect(() => {
    if (user?.userId) {
      form.setValue("atendidoPorUsuarioId", user.userId);
    }
  }, [user, form]);

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [townships, setTownships] = useState<Township[]>([]);
  const [openColoniaPopover, setOpenColoniaPopover] = useState(false);
  const [coloniaSearch, setColoniaSearch] = useState("");

  const watchedStateId = form.watch("stateId");
  const watchedMunicipalityId = form.watch("municipalityId");
  const watchedCodigoPostalId = form.watch("codigoPostalId");
  const watchedCampusId = form.watch("campusId");

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

  const filteredStudyPlans = useMemo(() => {
    if (!watchedCampusId || watchedCampusId === 0) return studyPlans;
    return studyPlans.filter((plan) => plan.idCampus === watchedCampusId);
  }, [studyPlans, watchedCampusId]);

  useEffect(() => {
    if (watchedCampusId) {
      const currentPlan = studyPlans.find((p) => p.idPlanEstudios === form.getValues("planEstudiosId"));
      if (currentPlan && currentPlan.idCampus !== watchedCampusId) {
        form.setValue("planEstudiosId", 0, { shouldValidate: false });
      }
    }
  }, [watchedCampusId, studyPlans, form]);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
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
              name="medioContactoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cómo nos conoció? <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona medio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contactMethods.map((method) => (
                        <SelectItem key={method.idMedioContacto} value={String(method.idMedioContacto)}>
                          {method.descMedio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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

        <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Información Académica</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="campusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campus <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona campus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {campus.map((c) => (
                        <SelectItem key={c.idCampus} value={String(c.idCampus)}>
                          {c.nombre}
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
              name="planEstudiosId"
              render={({ field }) => (
                <FormItem className="lg:col-span-2">
                  <FormLabel>Plan de Estudios <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                    disabled={!watchedCampusId || watchedCampusId === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchedCampusId ? "Selecciona plan de estudios" : "Primero selecciona un campus"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredStudyPlans.map((plan) => (
                        <SelectItem key={plan.idPlanEstudios} value={String(plan.idPlanEstudios)}>
                          {plan.nombrePlanEstudios}
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
              name="horarioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona horario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule.idTurno} value={String(schedule.idTurno)}>
                          {schedule.nombre}
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
              name="cuatrimestreInteres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuatrimestre de Interés</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona cuatrimestre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num}° Cuatrimestre
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
              name="aspiranteStatusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estatus <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona estatus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {applicantStatus.map((status) => (
                        <SelectItem key={status.idAspiranteEstatus} value={String(status.idAspiranteEstatus)}>
                          {status.descEstatus}
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
              name="notas"
              render={({ field }) => (
                <FormItem className="lg:col-span-3">
                  <FormLabel>Notas / Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el aspirante (opcional)"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Crear Aspirante
          </Button>
        </div>
      </form>
    </Form>
  );
}
