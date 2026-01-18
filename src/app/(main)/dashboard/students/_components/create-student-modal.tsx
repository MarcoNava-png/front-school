"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createStudent } from "@/services/students-service";

import { createStudentSchema } from "./schema-create-student";

interface CreateStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStudentModal({ open, onOpenChange }: CreateStudentModalProps) {
  const form = useForm({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      matricula: "",
      nombreCompleto: "",
      telefono: "",
      planEstudios: "",
      fechaIngreso: "",
      activo: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createStudent(data);
      toast.success("Estudiante creado correctamente");
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error al crear estudiante", { description: error?.message ?? "Intenta nuevamente." });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="create-student-description">
        <DialogHeader>
          <DialogTitle>Crear estudiante</DialogTitle>
        </DialogHeader>
        <div id="create-student-description" className="sr-only">
          Complete el formulario para crear un nuevo estudiante.
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input {...field} id="matricula" required />
                  </FormControl>
                  {form.formState.touchedFields.matricula || form.formState.isSubmitted ? <FormMessage /> : null}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombreCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input {...field} id="nombreCompleto" required />
                  </FormControl>
                  {form.formState.touchedFields.nombreCompleto || form.formState.isSubmitted ? <FormMessage /> : null}
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
                    <Input {...field} id="telefono" required />
                  </FormControl>
                  {form.formState.touchedFields.telefono || form.formState.isSubmitted ? <FormMessage /> : null}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planEstudios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan de estudios</FormLabel>
                  <FormControl>
                    <Input {...field} id="planEstudios" required />
                  </FormControl>
                  {form.formState.touchedFields.planEstudios || form.formState.isSubmitted ? <FormMessage /> : null}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaIngreso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de ingreso</FormLabel>
                  <FormControl>
                    <Input {...field} id="fechaIngreso" type="date" required />
                  </FormControl>
                  {form.formState.touchedFields.fechaIngreso || form.formState.isSubmitted ? <FormMessage /> : null}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox id="activo" checked={field.value} onCheckedChange={field.onChange} className="size-5" />
                  </FormControl>
                  <FormLabel htmlFor="activo" className="text-sm font-medium">
                    ¿Está activo?
                  </FormLabel>
                  {form.formState.touchedFields.activo || form.formState.isSubmitted ? <FormMessage /> : null}
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button className="w-full" type="submit">
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
