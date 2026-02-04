"use client";

import { Clock, MapPin, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { timeToMinutes } from "@/lib/schedule-validation";
import type { DiaSemana, GrupoMateria } from "@/types/group";

interface ScheduleGridViewProps {
  materias: GrupoMateria[];
  nombreGrupo?: string;
}

const DIAS_SEMANA: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function ScheduleGridView({ materias, nombreGrupo }: ScheduleGridViewProps) {
  const horariosPorDiaYHora: Record<DiaSemana, Array<{
    hora: string;
    materias: Array<{
      materia: GrupoMateria;
      horaInicio: string;
      horaFin: string;
      aula: string;
      duracionSlots: number;
    }>;
  }>> = {
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
    Sábado: [],
    Domingo: [],
  };

  materias.forEach((materia) => {
    if (!materia.horarioJson || materia.horarioJson.length === 0) return;

    materia.horarioJson.forEach((horario) => {
      const minutosInicio = timeToMinutes(horario.horaInicio);
      const minutosFin = timeToMinutes(horario.horaFin);
      const duracionMinutos = minutosFin - minutosInicio;
      const duracionSlots = duracionMinutos / 60;

      const horaSlot = `${Math.floor(minutosInicio / 60).toString().padStart(2, "0")}:00`;

      if (!horariosPorDiaYHora[horario.dia]) {
        horariosPorDiaYHora[horario.dia] = [];
      }

      const existingSlot = horariosPorDiaYHora[horario.dia].find(
        (slot) => slot.hora === horaSlot
      );

      if (existingSlot) {
        existingSlot.materias.push({
          materia,
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin,
          aula: horario.aula,
          duracionSlots,
        });
      } else {
        horariosPorDiaYHora[horario.dia].push({
          hora: horaSlot,
          materias: [
            {
              materia,
              horaInicio: horario.horaInicio,
              horaFin: horario.horaFin,
              aula: horario.aula,
              duracionSlots,
            },
          ],
        });
      }
    });
  });

  return (
    <div className="space-y-4">
      {nombreGrupo && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Horario del Grupo {nombreGrupo}
          </h3>
        </div>
      )}

      <div className="space-y-3">
        {DIAS_SEMANA.map((dia) => {
          const sesionesDelDia = materias.flatMap((materia) =>
            (materia.horarioJson || [])
              .filter((h) => h.dia === dia)
              .map((h) => ({ ...h, materia }))
          );

          if (sesionesDelDia.length === 0) return null;

          sesionesDelDia.sort((a, b) =>
            timeToMinutes(a.horaInicio) - timeToMinutes(b.horaInicio)
          );

          return (
            <Card key={dia} className="p-4 bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                    {dia}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {sesionesDelDia.length} sesión(es)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {sesionesDelDia.map((sesion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-shrink-0 w-24 text-center">
                      <div className="text-sm font-semibold text-blue-700">
                        {sesion.horaInicio}
                      </div>
                      <div className="text-xs text-gray-500">a</div>
                      <div className="text-sm font-semibold text-blue-700">
                        {sesion.horaFin}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {sesion.materia.nombreMateria}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            {sesion.materia.nombreProfesor && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{sesion.materia.nombreProfesor}</span>
                              </div>
                            )}
                            {sesion.aula && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{sesion.aula}</span>
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {sesion.materia.claveMateria}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-500">
                            {sesion.materia.inscritos}/{sesion.materia.cupo}
                          </div>
                          <div className="text-xs font-medium text-gray-700">
                            {sesion.materia.creditos} créd.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {materias.every((m) => !m.horarioJson || m.horarioJson.length === 0) && (
        <Card className="p-8 text-center bg-gray-50 border-dashed">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay horarios configurados</p>
          <p className="text-gray-500 text-sm mt-1">
            Las materias aún no tienen horarios asignados
          </p>
        </Card>
      )}
    </div>
  );
}
