"use client";

import { useState } from "react";

import { Plus, Trash2, Clock, AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  validateNewSchedule,
  calculateWeeklyHours,
  generateScheduleSummary,
} from "@/lib/schedule-validation";
import type { HorarioMateria, DiaSemana } from "@/types/group";

const DIAS_SEMANA: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

interface SchedulePickerProps {
  value: HorarioMateria[];
  onChange: (horarios: HorarioMateria[]) => void;
  aulaDefault?: string;
}

export function SchedulePicker({ value, onChange, aulaDefault = "" }: SchedulePickerProps) {
  const [selectedDay, setSelectedDay] = useState<DiaSemana>("Lunes");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [aula, setAula] = useState(aulaDefault);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!selectedDay || !horaInicio || !horaFin) {
      return;
    }

    const newHorario: HorarioMateria = {
      dia: selectedDay,
      horaInicio,
      horaFin,
      aula: aula || aulaDefault,
    };

    const validation = validateNewSchedule(newHorario, value);
    if (!validation.valid) {
      setValidationError(validation.error || "Error de validación");
      return;
    }

    onChange([...value, newHorario]);
    setValidationError(null);

    setHoraInicio("08:00");
    setHoraFin("10:00");
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const horariosPorDia = DIAS_SEMANA.map((dia) => ({
    dia,
    horarios: value.filter((h) => h.dia === dia),
  }));

  const horasSemanales = calculateWeeklyHours(value);

  return (
    <div className="space-y-4">
      {validationError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{validationError}</AlertDescription>
        </Alert>
      )}

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-900">Agregar Horario</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <Label htmlFor="dia" className="text-xs text-gray-700 mb-1">
              Día
            </Label>
            <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as DiaSemana)}>
              <SelectTrigger
                id="dia"
                className="!text-gray-900 !bg-white border-gray-300 h-9"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem
                    key={dia}
                    value={dia}
                    className="!text-gray-900 !bg-white hover:!bg-blue-50 data-[highlighted]:!bg-blue-50 data-[highlighted]:!text-gray-900 data-[state=checked]:!text-gray-900 cursor-pointer"
                  >
                    {dia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="horaInicio" className="text-xs text-gray-700 mb-1">
              Hora Inicio
            </Label>
            <Input
              id="horaInicio"
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="h-9 !text-gray-900 !bg-white border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="horaFin" className="text-xs text-gray-700 mb-1">
              Hora Fin
            </Label>
            <Input
              id="horaFin"
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="h-9 !text-gray-900 !bg-white border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="aula" className="text-xs text-gray-700 mb-1">
              Aula
            </Label>
            <Input
              id="aula"
              type="text"
              placeholder="Ej: A-101"
              value={aula}
              onChange={(e) => setAula(e.target.value)}
              className="h-9 !text-gray-900 !bg-white border-gray-300"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAdd}
              size="sm"
              className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          Horarios Configurados ({value.length})
        </Label>

        {value.length === 0 ? (
          <Card className="p-6 text-center bg-gray-50 dark:bg-gray-900/20 border-dashed">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No hay horarios configurados. Agrega al menos uno.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {horariosPorDia.map(({ dia, horarios }) =>
              horarios.length > 0 ? (
                <Card key={dia} className="p-3 bg-white dark:bg-gray-800 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                      {dia}
                    </Badge>
                    <span className="text-xs text-gray-500">{horarios.length} sesión(es)</span>
                  </div>
                  <div className="space-y-1.5">
                    {horarios.map((horario, idx) => {
                      const globalIndex = value.findIndex(
                        (h) =>
                          h.dia === horario.dia &&
                          h.horaInicio === horario.horaInicio &&
                          h.horaFin === horario.horaFin &&
                          h.aula === horario.aula
                      );
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {horario.horaInicio} - {horario.horaFin}
                            </div>
                            {horario.aula && (
                              <div className="text-xs text-gray-500 truncate">
                                {horario.aula}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(globalIndex)}
                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 ml-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ) : null
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Resumen Semanal</h4>
            <Badge variant="secondary" className="bg-blue-200 text-blue-800">
              {horasSemanales} hrs/semana
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIAS_SEMANA.map((dia) => {
              const horariosDia = value.filter((h) => h.dia === dia);
              return (
                <div
                  key={dia}
                  className={`flex-1 min-w-[100px] p-2 rounded text-center ${
                    horariosDia.length > 0
                      ? "bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-300 dark:border-blue-700"
                      : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {dia.substring(0, 3)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {horariosDia.length > 0 ? `${horariosDia.length}` : "-"}
                  </div>
                </div>
              );
            })}
          </div>
          {value.length > 0 && (
            <div className="mt-3 p-2 bg-white dark:bg-gray-800/50 rounded text-xs text-gray-600 dark:text-gray-400">
              <strong>Resumen:</strong> {generateScheduleSummary(value)}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
