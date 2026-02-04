"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AcademicPeriod, StudyPlan } from "@/types/catalog";

interface FiltersSectionProps {
  studyPlans: StudyPlan[];
  academicPeriods: AcademicPeriod[];
  selectedPlanId: string;
  setSelectedPlanId: (value: string) => void;
  selectedPeriodId: string;
  setSelectedPeriodId: (value: string) => void;
  cuatrimestreFilter: string;
  setCuatrimestreFilter: (value: string) => void;
  loading: boolean;
  loadAvailableGroups: () => void;
}

export function FiltersSection({
  studyPlans,
  academicPeriods,
  selectedPlanId,
  setSelectedPlanId,
  selectedPeriodId,
  setSelectedPeriodId,
  cuatrimestreFilter,
  setCuatrimestreFilter,
  loading,
  loadAvailableGroups,
}: FiltersSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="plan" className="text-sm font-medium !text-gray-900">
          Plan de Estudios
        </Label>
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger className="w-full border-2 border-gray-400 bg-white !text-gray-900 [&_span]:!text-gray-900">
            <SelectValue placeholder="Selecciona un plan" className="!text-gray-900" />
          </SelectTrigger>
          <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px] border-2 border-blue-500">
            {studyPlans.length === 0 ? (
              <div className="p-4 text-center text-gray-900 bg-gray-100">No hay planes disponibles</div>
            ) : (
              studyPlans.map((plan) => (
                <SelectItem
                  key={plan.idPlanEstudios}
                  value={plan.idPlanEstudios.toString()}
                  className="!text-gray-900 !bg-white hover:!bg-blue-50 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer min-h-[40px] [&_span]:!text-gray-900"
                >
                  {plan.nombrePlanEstudios}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {studyPlans.length > 0 && (
          <p className="text-xs text-gray-500">Total: {studyPlans.length} planes disponibles</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="period" className="text-sm font-medium !text-gray-900">
          Periodo Académico
        </Label>
        <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
          <SelectTrigger className="w-full bg-white border-gray-300 !text-gray-900 [&_span]:!text-gray-900">
            <SelectValue placeholder="Selecciona periodo" className="!text-gray-900" />
          </SelectTrigger>
          <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px]">
            {academicPeriods.length === 0 ? (
              <div className="p-4 text-center text-gray-900 bg-gray-100">No hay períodos disponibles</div>
            ) : (
              academicPeriods.map((period) => (
                <SelectItem
                  key={period.idPeriodoAcademico}
                  value={period.idPeriodoAcademico.toString()}
                  className="!text-gray-900 !bg-white hover:!bg-blue-50 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer min-h-[40px]"
                >
                  {period.nombre}
                </SelectItem>
              ))
            )}

          </SelectContent>
        </Select>
        {academicPeriods.length > 0 && (
          <p className="text-xs text-gray-500">Total: {academicPeriods.length} períodos disponibles</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cuatrimestre" className="text-sm font-medium !text-gray-900">
          Cuatrimestre
        </Label>
        <Select value={cuatrimestreFilter} onValueChange={setCuatrimestreFilter}>
          <SelectTrigger className="w-full bg-white border-gray-300 !text-gray-900 [&_span]:!text-gray-900">
            <SelectValue className="!text-gray-900" />
          </SelectTrigger>
          <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <SelectItem
                key={num}
                value={num.toString()}
                className="!text-gray-900 !bg-white hover:!bg-blue-50 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer [&_span]:!text-gray-900"
              >
                {num}° Cuatrimestre
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button onClick={loadAvailableGroups} disabled={!selectedPlanId || !selectedPeriodId || loading} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
    </div>
  );
}
