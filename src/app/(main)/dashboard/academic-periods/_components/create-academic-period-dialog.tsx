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
import { createAcademicPeriod } from "@/services/academic-period-service";
import { getPeriodicity } from "@/services/catalogs-service";
import { Periodicity } from "@/types/catalog";

interface CreateAcademicPeriodDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAcademicPeriodDialog({ open, setOpen, onSuccess }: CreateAcademicPeriodDialogProps) {
  const form = useForm({
    defaultValues: {
      clave: "",
      nombre: "",
      idPeriodicidad: "",
      fechaInicio: "",
      fechaFin: "",
    },
  });
  const [periodicity, setPeriodicity] = useState<Periodicity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPeriodicity().then((res) => setPeriodicity(res ?? []));
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createAcademicPeriod({
        ...data,
        idPeriodicidad: Number(data.idPeriodicidad),
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
      toast.success("Periodo académico creado exitosamente");
    } catch {
      toast.error("Error al crear el periodo académico");
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
          <DialogTitle>Crear periodo académico</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
              <FormField
                name="clave"
                render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="Clave" required className="w-full" />}
              />
              <FormField
                name="nombre"
                render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder="Nombre" required className="w-full" />}
              />
              <FormField
                name="idPeriodicidad"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
                name="fechaInicio"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} type="date" placeholder="Fecha de inicio" required className="w-full" />
                )}
              />
              <FormField
                name="fechaFin"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} type="date" placeholder="Fecha de fin" required className="w-full" />
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
