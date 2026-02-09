"use client";

import { useCallback, useEffect, useState } from "react";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addSubjectToGroup } from "@/services/groups-service";
import { getMattersByStudyPlan } from "@/services/matter-plan-service";
import type { HorarioMateria } from "@/types/group";
import type { MatterPlan } from "@/types/matter-plan";

import { SchedulePicker } from "./schedule-picker";

interface AddSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idGrupo: number;
  idPlanEstudios?: number;
  onSuccess: () => void;
  periodicidadLabel?: string;
}

export function AddSubjectModal({
  open,
  onOpenChange,
  idGrupo,
  idPlanEstudios,
  onSuccess,
  periodicidadLabel = "Cuatrimestre",
}: AddSubjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMatters, setLoadingMatters] = useState(false);
  const [availableMatters, setAvailableMatters] = useState<MatterPlan[]>([]);
  const [idMateriaPlan, setIdMateriaPlan] = useState("");
  const [cupo, setCupo] = useState("30");
  const [aula, setAula] = useState("");
  const [horarios, setHorarios] = useState<HorarioMateria[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);

  const loadMatters = useCallback(async () => {
    if (!idPlanEstudios) return;

    setLoadingMatters(true);
    try {
      const matters = await getMattersByStudyPlan(idPlanEstudios);
      setAvailableMatters(matters);
    } catch (error) {
      console.error("Error loading matters:", error);
      toast.error("Error al cargar las materias del plan");
      setAvailableMatters([]);
    } finally {
      setLoadingMatters(false);
    }
  }, [idPlanEstudios]);

  useEffect(() => {
    if (open && idPlanEstudios) {
      loadMatters();
    }
    if (!open) {
      resetForm();
    }
  }, [open, idPlanEstudios, loadMatters]);

  const resetForm = () => {
    setIdMateriaPlan("");
    setCupo("30");
    setAula("");
    setHorarios([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idMateriaPlan) {
      toast.error("Selecciona una materia");
      return;
    }

    if (horarios.length === 0) {
      toast.error("Agrega al menos un horario para la materia");
      return;
    }

    setLoading(true);
    try {
      await addSubjectToGroup(idGrupo, {
        idMateriaPlan: parseInt(idMateriaPlan),
        cupo: parseInt(cupo),
        aula: aula ? aula : undefined,
        horarioJson: horarios,
      });

      toast.success("Materia agregada al grupo con horarios configurados");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Error adding subject:", error);
      const err = error as { response?: { data?: { mensaje?: string } }; message?: string };
      const errorMessage = err?.response?.data?.mensaje ?? err?.message ?? "Error al agregar la materia";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Materia al Grupo
          </DialogTitle>
          <DialogDescription>
            Agrega una materia individual con sus horarios a este grupo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-900">
              <strong>Nota:</strong> Configura los horarios de clase para la materia. Esta información aparecerá en los
              horarios de estudiantes y profesores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materia" className="text-sm">
                Materia *
              </Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between !text-gray-900 !bg-white border-gray-300 h-10"
                    disabled={loadingMatters || availableMatters.length === 0}
                  >
                    {idMateriaPlan
                      ? (() => {
                          const selectedMatter = availableMatters.find(
                            (matter) => matter.idMateriaPlan.toString() === idMateriaPlan
                          );
                          return selectedMatter?.nombreMateria ?? selectedMatter?.materia ?? "Materia seleccionada";
                        })()
                      : loadingMatters
                        ? "Cargando..."
                        : "Buscar materia..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por nombre o clave..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No se encontraron materias.</CommandEmpty>
                      <CommandGroup>
                        {availableMatters.map((matter) => (
                          <CommandItem
                            key={matter.idMateriaPlan}
                            value={`${matter.claveMateria ?? ''} ${matter.nombreMateria ?? matter.materia}`}
                            onSelect={() => {
                              setIdMateriaPlan(matter.idMateriaPlan.toString());
                              setOpenCombobox(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                idMateriaPlan === matter.idMateriaPlan.toString()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {matter.claveMateria && `${matter.claveMateria} - `}
                                {matter.nombreMateria ?? matter.materia}
                              </span>
                              {matter.creditos && (
                                <span className="text-xs text-gray-500">
                                  {matter.creditos} créditos
                                </span>
                              )}
                              {!matter.creditos && (
                                <span className="text-xs text-gray-500">
                                  {periodicidadLabel} {matter.cuatrimestre}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {availableMatters.length === 0 && !loadingMatters && (
                <p className="text-xs text-red-600">
                  No hay materias disponibles en este plan de estudios
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cupo" className="text-sm">
                Cupo Máximo *
              </Label>
              <Input
                id="cupo"
                type="number"
                min="1"
                value={cupo}
                onChange={(e) => setCupo(e.target.value)}
                placeholder="30"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aula" className="text-sm">
                Aula Principal
              </Label>
              <Input
                id="aula"
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                placeholder="Ej: A-201"
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Se usará como default en horarios
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-base font-semibold mb-3 block">Horarios de Clase *</Label>
            <SchedulePicker value={horarios} onChange={setHorarios} aulaDefault={aula} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || horarios.length === 0}>
              {loading ? "Agregando..." : "Agregar Materia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
