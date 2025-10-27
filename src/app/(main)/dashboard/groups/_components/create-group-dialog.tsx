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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createGroup } from "@/services/group-service";
import { AcademicPeriod } from "@/types/academic-period";
import { StudyPlan } from "@/types/study-plan";

interface CreateGroupDialogProps {
  open: boolean;
  studyPlans: StudyPlan[];
  academicPeriods: AcademicPeriod[];
  setOpen: (open: boolean) => void;
}

export function CreateGroupDialog({ open, setOpen, studyPlans, academicPeriods }: CreateGroupDialogProps) {
  const form = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createGroup({
        idPlanEstudios: Number(data.idPlanEstudios),
        idPeriodoAcademico: Number(data.idPeriodoAcademico),
        numeroCuatrimestre: Number(data.numeroCuatrimestre),
        numeroGrupo: Number(data.numeroGrupo),
        idTurno: Number(data.idTurno),
        capacidadMaxima: Number(data.capacidadMaxima),
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
          <DialogTitle>Crear grupo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
              <FormField
                name="idPlanEstudios"
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Plan de estudios" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {studyPlans.map((plan) => (
                        <SelectItem key={plan.idPlanEstudios} value={String(plan.idPlanEstudios)}>
                          {plan.nombrePlanEstudios}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                name="idPeriodoAcademico"
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Periodo académico" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {academicPeriods.map((period) => (
                        <SelectItem key={period.idPeriodoAcademico} value={String(period.idPeriodoAcademico)}>
                          {period.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                name="numeroCuatrimestre"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Cuatrimestre" required className="w-full" />
                )}
              />
              <FormField
                name="numeroGrupo"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Número de grupo" required className="w-full" />
                )}
              />
              <FormField
                name="idTurno"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="ID Turno" required className="w-full" />
                )}
              />
              <FormField
                name="capacidadMaxima"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Capacidad máxima" required className="w-full" />
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
