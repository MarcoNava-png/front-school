"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createInscription } from "@/services/inscription-service";
import { PayloadInscription } from "@/types/inscription";
import { MatterPlan } from "@/types/matter-plan";

interface InscribeStudentModalProps {
  open: boolean;
  matterPlans: MatterPlan[];
  onOpenChange: (open: boolean) => void;
  studentId: number;
}

export function InscribeStudentModal({ open, onOpenChange, studentId, matterPlans }: InscribeStudentModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      idGrupoMateria: matterPlans.length > 0 ? matterPlans[0].idMateriaPlan : 0,
      fechaInscripcion: new Date().toISOString().slice(0, 10),
      estado: "activo",
    },
  });

  const handleInscription = async (data: { idGrupoMateria: number; fechaInscripcion: string; estado: string }) => {
    setLoading(true);
    try {
      const payload: PayloadInscription = {
        idEstudiante: studentId,
        idGrupoMateria: Number(data.idGrupoMateria),
        fechaInscripcion: data.fechaInscripcion,
        estado: data.estado,
      };
      await createInscription(payload);
      toast.success("Estudiante inscrito correctamente");
      form.reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Error al inscribir estudiante", {
        description: e?.response.data ?? "No se logro inscribir al estudiante.",
      });
    } finally {
      setLoading(false);
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
      <DialogContent className="max-w-2xl" aria-describedby="inscribe-student-description">
        <DialogHeader>
          <DialogTitle>Inscribir estudiante</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInscription)} className="grid grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="idGrupoMateria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo/Materia</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      required
                      className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none bg-background text-foreground border-input"
                      style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value={0} disabled style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}>
                        Selecciona grupo/materia
                      </option>
                      {matterPlans.map((plan) => (
                        <option key={plan.idMateriaPlan} value={plan.idMateriaPlan} style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}>
                          {plan.materia} - {plan.nombrePlanEstudios}
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
              name="fechaInscripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha inscripción</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      required
                      className="block w-full rounded border px-3 py-2 focus:ring focus:outline-none bg-background text-foreground border-input"
                      style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
                      value={field.value}
                    >
                      <option value="activo" style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}>Activo</option>
                      <option value="pendiente" style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}>Pendiente</option>
                      <option value="cancelado" style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}>Cancelado</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2 flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? "Inscribiendo..." : "Confirmar inscripción"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
