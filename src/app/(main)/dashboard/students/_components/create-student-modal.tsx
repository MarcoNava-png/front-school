"use client";

import { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createStudent } from "@/services/students-service";

import { createStudentSchema } from "./schema-create-student";

interface CreateStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
}

export function CreateStudentModal({ open, onOpenChange, children }: CreateStudentModalProps) {
  const form = useForm({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      matricula: "",
      nombreCompleto: "",
      telefono: "",
      planEstudios: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createStudent(data);
      toast.success("Estudiante creado correctamente");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error al crear estudiante", { description: error?.message ?? "Intenta nuevamente." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <FormMessage />
                  {!form.formState.errors.matricula && (
                    <p className="text-destructive text-sm">
                      La matrícula es obligatoria y debe tener al menos 3 caracteres.
                    </p>
                  )}
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
                  <FormMessage />
                  {!form.formState.errors.nombreCompleto && (
                    <p className="text-destructive text-sm">El nombre completo es obligatorio.</p>
                  )}
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
                  <FormMessage />
                  {!form.formState.errors.telefono && (
                    <p className="text-destructive text-sm">El teléfono es obligatorio y debe ser válido.</p>
                  )}
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
                  <FormMessage />
                  {!form.formState.errors.planEstudios && (
                    <p className="text-destructive text-sm">El plan de estudios es obligatorio.</p>
                  )}
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
