"use client";

import { useEffect, useState } from "react";

import { Calendar, Clock, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStudyPlans, getAcademicPeriods } from "@/services/catalogs-service";
import { getAcademicManagement } from "@/services/groups-service";
import type { AcademicPeriod } from "@/types/academic-period";
import type { StudyPlan } from "@/types/catalog";
import type { GestionAcademicaResponse, GrupoMateria } from "@/types/group";

import { ScheduleGridView } from "../academic-management/_components/schedule-grid-view";

export default function SchedulesPage() {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [academicData, setAcademicData] = useState<GestionAcademicaResponse | null>(null);
  const [groupSubjects, setGroupSubjects] = useState<GrupoMateria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPlan && selectedPeriod) {
      loadAcademicData();
    }
  }, [selectedPlan, selectedPeriod]);

  const loadInitialData = async () => {
    try {
      const [plansData, periodsData] = await Promise.all([
        getStudyPlans(),
        getAcademicPeriods(),
      ]);
      setStudyPlans(plansData || []);
      setPeriods(periodsData as any || []);

      const activePeriod = periodsData?.find((p: any) => p.esPeriodoActual);
      if (activePeriod) {
        setSelectedPeriod(activePeriod.idPeriodoAcademico);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar los datos iniciales");
    }
  };

  const loadAcademicData = async () => {
    if (!selectedPlan || !selectedPeriod) return;

    setLoading(true);
    try {
      const data = await getAcademicManagement(selectedPlan, selectedPeriod);
      setAcademicData(data);
      setSelectedGroup(null);
      setGroupSubjects([]);
    } catch (error) {
      console.error("Error loading academic data:", error);
      toast.error("Error al cargar los grupos");
      setAcademicData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = async (idGrupo: number) => {
    setSelectedGroup(idGrupo);

    const grupo = academicData?.gruposPorCuatrimestre
      .flatMap((c) => c.grupos)
      .find((g) => g.idGrupo === idGrupo);

    if (!grupo) return;

    setLoading(true);
    try {
      const { getGroupSubjects } = await import("@/services/groups-service");
      const subjects = await getGroupSubjects(idGrupo);
      setGroupSubjects(subjects);
    } catch (error) {
      console.error("Error loading group subjects:", error);
      toast.error("Error al cargar las materias del grupo");
      setGroupSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroupData = academicData?.gruposPorCuatrimestre
    .flatMap((c) => c.grupos)
    .find((g) => g.idGrupo === selectedGroup);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Horarios Académicos
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza los horarios de clases por grupo
          </p>
        </div>
      </div>
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-sm font-medium text-gray-900">
                Plan de Estudios
              </Label>
              <Select
                value={selectedPlan?.toString()}
                onValueChange={(v) => setSelectedPlan(parseInt(v))}
              >
                <SelectTrigger
                  id="plan"
                  className="w-full !text-gray-900 !bg-white border-gray-300"
                >
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {studyPlans.map((plan) => (
                    <SelectItem
                      key={plan.idPlanEstudios}
                      value={plan.idPlanEstudios.toString()}
                      className="!text-gray-900 !bg-white hover:!bg-blue-50 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer"
                    >
                      {plan.nombrePlanEstudios}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm font-medium text-gray-900">
                Periodo Académico
              </Label>
              <Select
                value={selectedPeriod?.toString()}
                onValueChange={(v) => setSelectedPeriod(parseInt(v))}
              >
                <SelectTrigger
                  id="period"
                  className="w-full !text-gray-900 !bg-white border-gray-300"
                >
                  <SelectValue placeholder="Selecciona un periodo" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem
                      key={period.idPeriodoAcademico}
                      value={period.idPeriodoAcademico.toString()}
                      className="!text-gray-900 !bg-white hover:!bg-blue-50 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer"
                    >
                      {period.nombre} {period.esPeriodoActual && "(Actual)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group" className="text-sm font-medium text-gray-900">
              Grupo
            </Label>
            <Select
              value={selectedGroup?.toString()}
              onValueChange={(v) => handleGroupSelect(parseInt(v))}
              disabled={!academicData || loading}
            >
              <SelectTrigger
                id="group"
                className="w-full !text-gray-900 !bg-white border-gray-300"
              >
                <SelectValue placeholder={!selectedPlan ? "Primero selecciona un plan" : "Selecciona un grupo"} />
              </SelectTrigger>
              <SelectContent>
                {academicData?.gruposPorCuatrimestre.map((cuatrimestre) => (
                  <div key={cuatrimestre.numeroCuatrimestre}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100">
                      Cuatrimestre {cuatrimestre.numeroCuatrimestre}
                    </div>
                    {cuatrimestre.grupos.map((grupo) => (
                      <SelectItem
                        key={grupo.idGrupo}
                        value={grupo.idGrupo.toString()}
                        className="!text-gray-900 !bg-white hover:!bg-blue-50 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer"
                      >
                        {grupo.nombreGrupo} ({grupo.codigoGrupo}) - {grupo.totalEstudiantes} estudiantes
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      {loading && (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Cargando horarios...</p>
        </Card>
      )}

      {!loading && selectedGroup && selectedGroupData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedGroupData.nombreGrupo}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {selectedGroupData.codigoGrupo}
                </Badge>
                <span className="text-sm text-gray-600">
                  {selectedGroupData.totalMaterias} materias
                </span>
                <span className="text-sm text-gray-600">
                  {selectedGroupData.totalEstudiantes}/{selectedGroupData.capacidadMaxima} estudiantes
                </span>
              </div>
            </div>
          </div>

          <ScheduleGridView materias={groupSubjects} />
        </Card>
      )}

      {!loading && !selectedGroup && academicData && (
        <Card className="p-12 text-center bg-gray-50 border-dashed">
          <ChevronDown className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Selecciona un grupo</p>
          <p className="text-gray-500 text-sm mt-1">
            Elige un grupo de la lista para ver su horario semanal
          </p>
        </Card>
      )}

      {!loading && !selectedPlan && (
        <Card className="p-12 text-center bg-gray-50 border-dashed">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Comienza seleccionando un plan de estudios</p>
          <p className="text-gray-500 text-sm mt-1">
            Usa los filtros superiores para visualizar horarios
          </p>
        </Card>
      )}
    </div>
  );
}
