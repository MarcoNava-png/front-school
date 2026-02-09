"use client";

import { useEffect, useState, useMemo } from "react";

import { BookOpen, Building2, GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCampusList } from "@/services/campus-service";
import { getAcademicPeriods, getStudyPlans } from "@/services/catalogs-service";
import { getAcademicManagement } from "@/services/groups-service";
import { Campus } from "@/types/campus";
import { AcademicPeriod, StudyPlan } from "@/types/catalog";
import { GestionAcademicaResponse } from "@/types/group";

import { CreateGroupModal } from "./_components/create-group-modal";
import { CuatrimestreSection } from "./_components/cuatrimestre-section";

export default function AcademicManagementPage() {
  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<string>("all");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [academicData, setAcademicData] = useState<GestionAcademicaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPlans = useMemo(() => {
    if (selectedCampusId === "all") return studyPlans;
    return studyPlans.filter(plan =>
      plan.idCampus?.toString() === selectedCampusId
    );
  }, [studyPlans, selectedCampusId]);

  const selectedPlan = useMemo(() => {
    return studyPlans.find(p => p.idPlanEstudios.toString() === selectedPlanId);
  }, [studyPlans, selectedPlanId]);

  const periodicidadLabel = useMemo(() => {
    if (!selectedPlan?.periodicidad) return "Cuatrimestre";
    return selectedPlan.periodicidad.toLowerCase().includes("semest") ? "Semestre" : "Cuatrimestre";
  }, [selectedPlan]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filteredPlans.length > 0) {
      const currentPlanExists = filteredPlans.some(p => p.idPlanEstudios.toString() === selectedPlanId);
      if (!currentPlanExists) {
        setSelectedPlanId(filteredPlans[0].idPlanEstudios.toString());
      }
    } else {
      setSelectedPlanId("");
    }
  }, [filteredPlans]);

  useEffect(() => {
    if (selectedPlanId) {
      loadAcademicData();
    }
  }, [selectedPlanId, selectedPeriodId]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [campusData, plansData, periodsData] = await Promise.all([
        getCampusList(),
        getStudyPlans(),
        getAcademicPeriods()
      ]);

      setCampusList(campusData.items || []);
      setStudyPlans(plansData);
      setAcademicPeriods(periodsData);

      const periodoActual = periodsData.find(p => p.esPeriodoActual);
      if (periodoActual) {
        setSelectedPeriodId(periodoActual.idPeriodoAcademico.toString());
      } else if (periodsData.length > 0) {
        setSelectedPeriodId(periodsData[0].idPeriodoAcademico.toString());
      }

      if (plansData.length > 0) {
        setSelectedPlanId(plansData[0].idPlanEstudios.toString());
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar los datos iniciales");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadAcademicData = async () => {
    if (!selectedPlanId) return;

    setLoading(true);
    try {
      const periodId = selectedPeriodId && selectedPeriodId !== "all"
        ? parseInt(selectedPeriodId)
        : undefined;
      const data = await getAcademicManagement(parseInt(selectedPlanId), periodId);
      setAcademicData(data);
    } catch (error) {
      console.error("Error loading academic data:", error);
      toast.error("Error al cargar la gestión académica");
      setAcademicData(null);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: '#14356F' }}></div>
          <p className="text-gray-600 text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <GraduationCap className="w-8 h-8" style={{ color: '#14356F' }} />
            </div>
            Gestión Académica de Grupos
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra grupos por licenciatura y {periodicidadLabel.toLowerCase()}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!selectedPlanId}
          className="text-white"
          style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="campus" className="text-sm font-medium !text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: '#14356F' }} />
            Campus
          </Label>
          <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
            <SelectTrigger className="w-full bg-white border-gray-300 !text-gray-900 [&_span]:!text-gray-900">
              <SelectValue placeholder="Todos los campus" className="!text-gray-900" />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px]">
              <SelectItem
                value="all"
                className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 data-[highlighted]:!bg-[#14356F]/10 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer [&_span]:!text-gray-900"
              >
                Todos los campus
              </SelectItem>
              {campusList.map((campus) => (
                <SelectItem
                  key={campus.idCampus}
                  value={campus.idCampus.toString()}
                  className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 data-[highlighted]:!bg-[#14356F]/10 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer [&_span]:!text-gray-900"
                >
                  {campus.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan" className="text-sm font-medium !text-gray-900">
            Licenciatura
          </Label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-full border-2 border-gray-400 bg-white !text-gray-900 [&_span]:!text-gray-900">
              <SelectValue placeholder="Selecciona un plan" className="!text-gray-900" />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px] border-2" style={{ borderColor: '#14356F' }}>
              {filteredPlans.length === 0 ? (
                <div className="p-4 text-center text-gray-900 bg-gray-100">
                  No hay planes disponibles
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <SelectItem
                    key={plan.idPlanEstudios}
                    value={plan.idPlanEstudios.toString()}
                    className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 data-[highlighted]:!bg-[#14356F]/10 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer min-h-[40px] [&_span]:!text-gray-900"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(20, 53, 111, 0.1)', color: '#14356F' }}>
                        {plan.clavePlanEstudios}
                      </span>
                      {plan.nombrePlanEstudios}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period" className="text-sm font-medium !text-gray-900">
            Periodo Académico
          </Label>
          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
            <SelectTrigger className="w-full bg-white border-gray-300 !text-gray-900">
              <SelectValue placeholder="Selecciona un periodo" className="!text-gray-900" />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px]">
              <SelectItem
                value="all"
                className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 data-[highlighted]:!bg-[#14356F]/10 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer"
              >
                Todos los periodos
              </SelectItem>
              {academicPeriods.map((period) => (
                <SelectItem
                  key={period.idPeriodoAcademico}
                  value={period.idPeriodoAcademico.toString()}
                  className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 data-[highlighted]:!bg-[#14356F]/10 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-gray-900">{period.nombre}</span>
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
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: '#14356F' }}></div>
          <p className="text-gray-600">Cargando grupos...</p>
        </div>
      ) : academicData ? (
        <div className="space-y-6">
          <div
            className="rounded-lg p-4 border-2"
            style={{
              background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))',
              borderColor: 'rgba(20, 53, 111, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" style={{ color: '#14356F' }} />
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#14356F' }}>{academicData.nombrePlan}</h2>
                <p style={{ color: '#1e4a8f' }} className="text-sm">
                  Duración: {academicData.duracionCuatrimestres} {periodicidadLabel.toLowerCase()}s
                </p>
              </div>
            </div>
          </div>

          {academicData.gruposPorCuatrimestre.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No hay grupos registrados</p>
              <p className="text-gray-500 text-sm mt-1">
                Crea el primer grupo para este plan de estudios
              </p>
            </div>
          ) : (
            academicData.gruposPorCuatrimestre.map((cuatrimestre) => (
              <CuatrimestreSection
                key={cuatrimestre.numeroCuatrimestre}
                cuatrimestre={cuatrimestre}
                idPlanEstudios={academicData.idPlanEstudios}
                onUpdate={loadAcademicData}
                periodicidadLabel={periodicidadLabel}
              />
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Selecciona un plan de estudios</p>
          <p className="text-gray-500 text-sm mt-1">
            Elige una licenciatura para ver su gestión académica
          </p>
        </div>
      )}

      <CreateGroupModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        idPlanEstudios={selectedPlanId ? parseInt(selectedPlanId) : undefined}
        defaultPeriodId={selectedPeriodId}
        onSuccess={loadAcademicData}
        periodicidadLabel={periodicidadLabel}
      />
    </div>
  );
}
