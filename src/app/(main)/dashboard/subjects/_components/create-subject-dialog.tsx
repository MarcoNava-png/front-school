import { useState } from "react";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createMatterPlan } from "@/services/matter-plan-service";

interface CreateSubjectDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateSubjectDialog({ open, setOpen }: CreateSubjectDialogProps) {
  const form = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createMatterPlan({
        idMateriaPlan: Math.floor(Math.random() * 1000000),
        idPlanEstudios: Number(data.idPlanEstudios),
        nombrePlanEstudios: data.nombrePlanEstudios,
        idMateria: Number(data.idMateria),
        materia: data.materia,
        cuatrimestre: Number(data.cuatrimestre),
        esOptativa: data.esOptativa === "true",
      });
      setOpen(false);
      form.reset();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Crear</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear materia</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
              <FormField
                name="idPlanEstudios"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="ID Plan de estudios" required className="w-full" />
                )}
              />
              <FormField
                name="nombrePlanEstudios"
                render={({ field }) => (
                  <Input {...field} placeholder="Nombre plan de estudios" required className="w-full" />
                )}
              />
              <FormField
                name="idMateria"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="ID Materia" required className="w-full" />
                )}
              />
              <FormField
                name="materia"
                render={({ field }) => <Input {...field} placeholder="Nombre materia" required className="w-full" />}
              />
              <FormField
                name="cuatrimestre"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Cuatrimestre" required className="w-full" />
                )}
              />
              <FormField
                name="esOptativa"
                render={({ field }) => (
                  <select {...field} className="w-full rounded-md border px-3 py-2">
                    <option value="false">No optativa</option>
                    <option value="true">Optativa</option>
                  </select>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
