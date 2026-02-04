"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPeriodicity } from "@/services/catalogs-service";

interface CreatePeriodicityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const defaultValues = {
  descPeriodicidad: "",
  periodosPorAnio: "",
  mesesPorPeriodo: "",
};

export function CreatePeriodicityDialog({ open, onOpenChange, onSuccess }: CreatePeriodicityDialogProps) {
  const form = useForm({ defaultValues });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: typeof defaultValues) => {
    setLoading(true);
    try {
      await createPeriodicity({
        descPeriodicidad: data.descPeriodicidad,
        periodosPorAnio: Number(data.periodosPorAnio),
        mesesPorPeriodo: Number(data.mesesPorPeriodo),
      });
      toast.success("Periodicidad creada exitosamente");
      onOpenChange(false);
      form.reset(defaultValues);
      onSuccess();
    } catch {
      toast.error("Error al crear la periodicidad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Periodicidad</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <FormField
                  name="descPeriodicidad"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ej: Cuatrimestral, Semestral"
                      required
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periodos por Ano</Label>
                  <FormField
                    name="periodosPorAnio"
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Ej: 3 para cuatrimestre"
                        required
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meses por Periodo</Label>
                  <FormField
                    name="mesesPorPeriodo"
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Ej: 4 para cuatrimestre"
                        required
                      />
                    )}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Ejemplos:</p>
                <ul className="space-y-1">
                  <li>Cuatrimestral: 3 periodos/ano, 4 meses/periodo</li>
                  <li>Semestral: 2 periodos/ano, 6 meses/periodo</li>
                  <li>Trimestral: 4 periodos/ano, 3 meses/periodo</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
