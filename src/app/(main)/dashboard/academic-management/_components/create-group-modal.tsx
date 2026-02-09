
"use client";

import { useEffect, useState } from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAcademicPeriods, getTurnos } from "@/services/catalogs-service";
import { createGroupWithSubjects } from "@/services/groups-service";
import { AcademicPeriod, Turno } from "@/types/catalog";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idPlanEstudios?: number;
  defaultPeriodId?: string;
  onSuccess: () => void;
  periodicidadLabel?: string;
}

export function CreateGroupModal({ open, onOpenChange, idPlanEstudios, defaultPeriodId, onSuccess, periodicidadLabel = "Cuatrimestre" }: CreateGroupModalProps) {
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [numeroCuatrimestre, setNumeroCuatrimestre] = useState("");
  const [numeroGrupo, setNumeroGrupo] = useState("");
  const [selectedTurnoId, setSelectedTurnoId] = useState("");
  const [capacidadMaxima, setCapacidadMaxima] = useState("30");
  const [cargarMaterias, setCargarMaterias] = useState(true);

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      resetForm();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [periodsData, turnosData] = await Promise.all([getAcademicPeriods(), getTurnos()]);

      setAcademicPeriods(periodsData);
      setTurnos(turnosData);

      if (defaultPeriodId && defaultPeriodId !== "all") {
        setSelectedPeriodId(defaultPeriodId);
      } else {
        const activePeriod = periodsData.find((p) => p.esPeriodoActual);
        if (activePeriod) {
          setSelectedPeriodId(activePeriod.idPeriodoAcademico.toString());
        } else if (periodsData.length > 0) {
          setSelectedPeriodId(periodsData[0].idPeriodoAcademico.toString());
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    }
  };

  const resetForm = () => {
    setSelectedPeriodId("");
    setNumeroCuatrimestre("");
    setNumeroGrupo("");
    setSelectedTurnoId("");
    setCapacidadMaxima("30");
    setCargarMaterias(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idPlanEstudios) {
      toast.error("Debe seleccionar un plan de estudios");
      return;
    }

    if (!selectedPeriodId || !numeroCuatrimestre || !numeroGrupo || !selectedTurnoId) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      const response = await createGroupWithSubjects({
        idPlanEstudios,
        idPeriodoAcademico: parseInt(selectedPeriodId),
        numeroCuatrimestre: parseInt(numeroCuatrimestre),
        numeroGrupo: parseInt(numeroGrupo),
        idTurno: parseInt(selectedTurnoId),
        capacidadMaxima: parseInt(capacidadMaxima),
        cargarMateriasAutomaticamente: cargarMaterias,
      });

      toast.success(
        <div className="space-y-1">
          <p className="font-bold">Grupo creado exitosamente</p>
          <p className="text-xs">
            {response.nombreGrupo} - {response.materiasAgregadas} materias agregadas
          </p>
        </div>,
        { duration: 5000 },
      );

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Error creating group:", error);
      const err = error as { response?: { data?: { mensaje?: string } }; message?: string };
      const errorMessage = err?.response?.data?.mensaje ?? err?.message ?? "Error al crear el grupo";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" style={{ color: '#14356F' }} />
            Crear Nuevo Grupo
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo grupo y opcionalmente carga todas las materias del {periodicidadLabel.toLowerCase()} automáticamente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="period" className="text-sm">
              Periodo Académico *
            </Label>
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccione un periodo" />
              </SelectTrigger>
              <SelectContent>
                {academicPeriods.map((period) => (
                  <SelectItem key={period.idPeriodoAcademico} value={period.idPeriodoAcademico.toString()}>
                    <span className="flex items-center gap-2">
                      <span>{period.nombre} ({period.clave})</span>
                      {period.esPeriodoActual && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: '#14356F', color: 'white' }}>
                          Actual
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuatrimestre" className="text-sm">
                Número de {periodicidadLabel} *
              </Label>
              <Input
                id="cuatrimestre"
                type="number"
                min="1"
                max="15"
                value={numeroCuatrimestre}
                onChange={(e) => setNumeroCuatrimestre(e.target.value)}
                placeholder="Ej: 1"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroGrupo" className="text-sm">
                Número de Grupo *
              </Label>
              <Input
                id="numeroGrupo"
                type="number"
                min="1"
                max="9"
                value={numeroGrupo}
                onChange={(e) => setNumeroGrupo(e.target.value)}
                placeholder="Ej: 1 (A), 2 (B)"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="turno" className="text-sm">
                Turno *
              </Label>
              <Select value={selectedTurnoId} onValueChange={setSelectedTurnoId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccione turno" />
                </SelectTrigger>
                <SelectContent>
                  {turnos.map((turno) => (
                    <SelectItem key={turno.idTurno} value={turno.idTurno.toString()}>
                      {turno.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidad" className="text-sm">
                Capacidad Máxima *
              </Label>
              <Input
                id="capacidad"
                type="number"
                min="1"
                value={capacidadMaxima}
                onChange={(e) => setCapacidadMaxima(e.target.value)}
                placeholder="Ej: 30"
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 rounded-lg" style={{ backgroundColor: 'rgba(20, 53, 111, 0.05)', border: '1px solid rgba(20, 53, 111, 0.2)' }}>
            <Checkbox id="cargarMaterias" checked={cargarMaterias} onCheckedChange={(checked) => setCargarMaterias(!!checked)} />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="cargarMaterias"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Cargar materias automáticamente
              </label>
              <p className="text-xs text-gray-600">
                Agrega todas las materias del {periodicidadLabel.toLowerCase()} al crear el grupo
              </p>
            </div>
          </div>

          {numeroCuatrimestre && selectedTurnoId && numeroGrupo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Vista previa del código:</p>
              <p className="font-mono text-lg font-bold text-gray-900">
                {numeroCuatrimestre}
                {selectedTurnoId}
                {numeroGrupo}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="text-white"
              style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
            >
              {loading ? "Creando..." : "Crear Grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
