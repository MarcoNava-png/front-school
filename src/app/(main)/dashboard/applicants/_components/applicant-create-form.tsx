"use client";

import { useEffect } from "react";

import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PayloadCreateApplicant } from "@/types/applicant";
import { Campus } from "@/types/campus";
import { ApplicantStatus, CivilStatus, ContactMethod, Genres, Schedule } from "@/types/catalog";
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
  onSubmit,
  onCancel,
}: ApplicantFormProps) {
  const user = useCurrentUser();

  useEffect(() => {
    if (user && user.id) {
      form.setValue("atendidoPorUsuarioId", user.id);
    }
  }, [user, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} required />
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
              <FormLabel>Apellido paterno</FormLabel>
              <FormControl>
                <Input {...field} required />
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
              <FormLabel>Apellido materno</FormLabel>
              <FormControl>
                <Input {...field} required />
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
              <FormLabel>Fecha de nacimiento</FormLabel>
              <FormControl>
                <Input {...field} type="date" required />
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
              <FormLabel>Género</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
                  value={field.value}
                >
                  <option value="" disabled>
                    Selecciona género
                  </option>
                  {genres.map((genre) => (
                    <option key={genre.idGenero} value={genre.idGenero}>
                      {genre.descGenero}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="correo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input {...field} type="email" required />
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
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="curp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CURP</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="calle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calle</FormLabel>
              <FormControl>
                <Input {...field} required />
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
              <FormLabel>Número exterior</FormLabel>
              <FormControl>
                <Input {...field} required />
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
              <FormLabel>Número interior</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="codigoPostalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Código Postal</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idEstadoCivil"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado Civil</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
                  value={field.value}
                >
                  <option value="" disabled>
                    Selecciona estado civil
                  </option>
                  {civilStatus.map((status) => (
                    <option key={status.idEstadoCivil} value={status.idEstadoCivil}>
                      {status.descEstadoCivil}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="campusId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campus</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
                  value={field.value}
                >
                  <option value="" disabled>
                    Selecciona campus
                  </option>
                  {campus.map((c) => (
                    <option key={c.idCampus} value={c.idCampus}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="planEstudiosId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan de estudios</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
                  value={field.value}
                >
                  <option value="" disabled>
                    Selecciona plan de estudios
                  </option>
                  {studyPlans.map((plan) => (
                    <option key={plan.idPlanEstudios} value={plan.idPlanEstudios}>
                      {plan.nombrePlanEstudios}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aspiranteStatusId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estatus del aspirante</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
                  value={field.value}
                >
                  <option value="" disabled>
                    Selecciona estatus
                  </option>
                  {applicantStatus.map((status) => (
                    <option key={status.idAspiranteEstatus} value={status.idAspiranteEstatus}>
                      {status.descEstatus}
                    </option>
                  ))}
                </select>
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
              <FormLabel>Medio de contacto</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
                  value={field.value}
                >
                  <option value="" disabled>
                    Selecciona medio de contacto
                  </option>
                  {contactMethods.map((method) => (
                    <option key={method.idMedioContacto} value={method.idMedioContacto}>
                      {method.descMedio}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horarioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none"
                  value={field.value}
                >
                  <option value="" disabled>
                    Selecciona horario
                  </option>
                  {schedules.map((schedule) => (
                    <option key={schedule.idTurno} value={schedule.idTurno}>
                      {schedule.nombre}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-2 flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="default">
            Crear aspirante
          </Button>
        </div>
      </form>
    </Form>
  );
}
