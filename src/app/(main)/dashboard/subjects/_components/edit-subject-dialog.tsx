"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMatterPlan } from "@/services/matter-plan-service";
import { MatterPlan } from "@/types/matter-plan";

interface EditSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: MatterPlan | null;
  onSuccess: () => void;
}

interface FormValues {
  cuatrimestre: string;
  esOptativa: string;
}

export function EditSubjectDialog({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: EditSubjectDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      cuatrimestre: "",
      esOptativa: "false",
    },
  });

  useEffect(() => {
    if (subject) {
      form.reset({
        cuatrimestre: subject.cuatrimestre?.toString() ?? "",
        esOptativa: subject.esOptativa ? "true" : "false",
      });
    }
  }, [subject, form]);

  const onSubmit = async (data: FormValues) => {
    if (!subject) return;

    setLoading(true);
    try {
      await updateMatterPlan({
        idMateriaPlan: subject.idMateriaPlan,
        idPlanEstudios: subject.idPlanEstudios,
        idMateria: subject.idMateria,
        cuatrimestre: Number(data.cuatrimestre),
        esOptativa: data.esOptativa === "true",
      });
      toast.success("Materia actualizada exitosamente");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Error al actualizar la materia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Materia</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FormLabel>Materia</FormLabel>
                <Input
                  value={subject?.nombreMateria ?? subject?.materia ?? ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Plan de Estudios</FormLabel>
                <Input
                  value={subject?.nombrePlanEstudios ?? ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <FormField
                control={form.control}
                name="cuatrimestre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuatrimestre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Ingrese el cuatrimestre"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="esOptativa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Materia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">Obligatoria</SelectItem>
                        <SelectItem value="true">Optativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
