"use client";

import { BookOpen, Calendar, Clock, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Group } from "@/types/group";

interface GroupCardProps {
  group: Group;
  onEnroll: (idGrupo: number, codigoGrupo: string) => void;
  disabled?: boolean;
  enrolling?: boolean;
}

export function GroupCard({ group, onEnroll, disabled, enrolling }: GroupCardProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled && !enrolling) {
      onEnroll(group.idGrupo, group.codigoGrupo);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Grupo {group.codigoGrupo}</h3>
            <p className="text-sm text-gray-600">{group.nombreGrupo}</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {group.consecutivoPeriodicidad}° Cuatri
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Turno: {group.turno}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{group.periodoAcademico}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span>{group.planEstudios}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Inscritos:</span>
                <span className="font-semibold text-gray-900">
                  {group.estudiantesInscritos ?? 0} / {group.capacidadMaxima}
                </span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${((group.estudiantesInscritos ?? 0) / group.capacidadMaxima * 100).toFixed(0)}%`
                  }}
                />
              </div>
              {(group.estudiantesInscritos ?? 0) >= group.capacidadMaxima && (
                <p className="text-xs text-red-600 mt-1 font-medium">⚠️ Grupo lleno</p>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={handleClick}
          disabled={disabled ?? enrolling}
          className="w-full"
          type="button"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {enrolling ? "Inscribiendo..." : "Inscribir a este Grupo"}
        </Button>
      </div>
    </div>
  );
}
