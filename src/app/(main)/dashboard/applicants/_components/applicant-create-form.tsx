"use client";

import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PayloadCreateApplicant } from "@/types/applicant";

interface ApplicantFormProps {
  form: UseFormReturn<PayloadCreateApplicant>;
  onSubmit: (data: PayloadCreateApplicant) => void;
  onCancel: () => void;
}

export function ApplicantCreateForm({ form, onSubmit, onCancel }: ApplicantFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
        {/* Campos del formulario */}
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
              <FormLabel>ID Género</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
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
              <FormLabel>ID Estado Civil</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
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
              <FormLabel>ID Campus</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
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
              <FormLabel>ID Plan de estudios</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
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
              <FormLabel>ID Estatus</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
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
              <FormLabel>ID Medio de contacto</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
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
          name="atendidoPorUsuarioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Usuario que atiende</FormLabel>
              <FormControl>
                <Input {...field} required />
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
              <FormLabel>ID Horario</FormLabel>
              <FormControl>
                <Input {...field} type="number" required />
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
