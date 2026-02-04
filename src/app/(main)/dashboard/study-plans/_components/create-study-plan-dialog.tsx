"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { getCampusList } from "@/services/campus-service";
import { getEducationLevels, getPeriodicity } from "@/services/catalogs-service";
import { createStudyPlan } from "@/services/study-plans-service";
import { Campus } from "@/types/campus";
import { EducationLevel, Periodicity } from "@/types/catalog";

interface CreateStudyPlanDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const defaultValues = {
  clavePlanEstudios: "",
  nombrePlanEstudios: "",
  rvoe: "",
  version: "",
  duracionMeses: "",
  minimaAprobatoriaParcial: "",
  minimaAprobatoriaFinal: "",
  permiteAdelantar: "false",
  idPeriodicidad: "",
  idNivelEducativo: "",
  idCampus: "",
};

export function CreateStudyPlanDialog({ open, setOpen, onSuccess }: CreateStudyPlanDialogProps) {
  const form = useForm({ defaultValues });
  const [campus, setCampus] = useState<Campus[]>([]);
  const [periodicity, setPeriodicity] = useState<Periodicity[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCampusList().then((res) => setCampus(res.items));
    getPeriodicity().then((res) => setPeriodicity(res));
    getEducationLevels().then((res) => setEducationLevels(res));
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createStudyPlan({
        ...data,
        permiteAdelantar: data.permiteAdelantar === "true",
        duracionMeses: Number(data.duracionMeses),
        minimaAprobatoriaParcial: Number(data.minimaAprobatoriaParcial),
        minimaAprobatoriaFinal: Number(data.minimaAprobatoriaFinal),
        idPeriodicidad: Number(data.idPeriodicidad),
        idNivelEducativo: Number(data.idNivelEducativo),
        idCampus: Number(data.idCampus),
      });
      toast.success("Plan de estudios creado exitosamente");
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (e) {
      console.error(e);
      toast.error("Error al crear el plan de estudios");
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
          <DialogTitle>Crear plan de estudio</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
              <FormField
                name="clavePlanEstudios"
                render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="Clave" required className="w-full" />}
              />
              <FormField
                name="nombrePlanEstudios"
                render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="Nombre" required className="w-full" />}
              />
              <FormField
                name="rvoe"
                render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="RVOE" required className="w-full" />}
              />
              <FormField
                name="version"
                render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="Version" required className="w-full" />}
              />
              <FormField
                name="duracionMeses"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} type="number" placeholder="Duracion (meses)" required className="w-full" />
                )}
              />
              <FormField
                name="minimaAprobatoriaParcial"
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    placeholder="Minima aprobatoria parcial"
                    required
                    className="w-full"
                  />
                )}
              />
              <FormField
                name="minimaAprobatoriaFinal"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} type="number" placeholder="Minima aprobatoria final" required className="w-full" />
                )}
              />
              <FormField
                name="permiteAdelantar"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "false"}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Permite adelantar" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="true">Si</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                name="idPeriodicidad"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Periodicidad" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {periodicity.map((p: Periodicity) => (
                        <SelectItem key={p.idPeriodicidad} value={String(p.idPeriodicidad)}>
                          {p.descPeriodicidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                name="idNivelEducativo"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nivel educativo" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {educationLevels.map((n: EducationLevel) => (
                        <SelectItem key={n.idNivelEducativo} value={String(n.idNivelEducativo)}>
                          {n.descNivelEducativo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormField
                name="idCampus"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Campus" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {campus.map((c: Campus) => (
                        <SelectItem key={c.idCampus} value={String(c.idCampus)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
