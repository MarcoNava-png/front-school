"use client";

import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GruposPorCuatrimestre } from "@/types/group";

import { GroupCard } from "./group-card";

interface CuatrimestreSectionProps {
  cuatrimestre: GruposPorCuatrimestre;
  idPlanEstudios?: number;
  onUpdate: () => void;
  periodicidadLabel?: string;
}

export function CuatrimestreSection({ cuatrimestre, idPlanEstudios, onUpdate, periodicidadLabel = "Cuatrimestre" }: CuatrimestreSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalEstudiantes = cuatrimestre.grupos.reduce((sum, g) => sum + g.totalEstudiantes, 0);
  const totalCapacidad = cuatrimestre.grupos.reduce((sum, g) => sum + g.capacidadMaxima, 0);

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div
        className="text-white p-4 cursor-pointer"
        style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold">
              {cuatrimestre.numeroCuatrimestre}° {periodicidadLabel}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {cuatrimestre.grupos.length} grupo{cuatrimestre.grupos.length !== 1 ? "s" : ""}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {totalEstudiantes}/{totalCapacidad} estudiantes
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          {cuatrimestre.grupos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay grupos en este {periodicidadLabel.toLowerCase()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cuatrimestre.grupos.map((grupo) => (
                <GroupCard
                  key={grupo.idGrupo}
                  grupo={{ ...grupo, idPlanEstudios }}
                  numeroCuatrimestre={cuatrimestre.numeroCuatrimestre}
                  onUpdate={onUpdate}
                  periodicidadLabel={periodicidadLabel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
