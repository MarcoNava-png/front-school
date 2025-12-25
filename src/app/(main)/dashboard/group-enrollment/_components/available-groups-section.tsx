"use client";

import { Users } from "lucide-react";

import { Group } from "@/types/group";

import { GroupCard } from "./group-card";

interface AvailableGroupsSectionProps {
  availableGroups: Group[];
  selectedPlanId: string;
  selectedPeriodId: string;
  loading: boolean;
  cuatrimestreFilter: string;
  selectedStudentId: number | null;
  enrolling: boolean;
  enrollingGroupId: number | null;
  onEnroll: (idGrupo: number, codigoGrupo: string) => void;
}

export function AvailableGroupsSection({
  availableGroups,
  selectedPlanId,
  selectedPeriodId,
  loading,
  cuatrimestreFilter,
  selectedStudentId,
  enrolling,
  enrollingGroupId,
  onEnroll,
}: AvailableGroupsSectionProps) {
  if (!selectedPlanId || !selectedPeriodId) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Selecciona un plan y periodo</p>
        <p className="text-gray-500 text-sm mt-1">Elige los filtros para ver los grupos disponibles</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Cargando grupos...</p>
      </div>
    );
  }

  if (availableGroups.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No hay grupos disponibles</p>
        <p className="text-gray-500 text-sm mt-1">
          No se encontraron grupos para el cuatrimestre {cuatrimestreFilter}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {availableGroups.map((group) => (
        <GroupCard
          key={group.idGrupo}
          group={group}
          onEnroll={onEnroll}
          disabled={!selectedStudentId || enrolling}
          enrolling={enrollingGroupId === group.idGrupo}
        />
      ))}
    </div>
  );
}
