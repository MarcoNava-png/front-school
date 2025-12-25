"use client";

import { useState } from "react";

import { AlertCircle, Calendar, Check } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setCurrentAcademicPeriod } from "@/services/academic-period-service";
import { AcademicPeriod } from "@/types/academic-period";

interface SetCurrentPeriodProps {
  periods: AcademicPeriod[];
  onUpdate: () => void;
}

export function SetCurrentPeriod({ periods, onUpdate }: SetCurrentPeriodProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const currentPeriod = periods.find((p) => p.esPeriodoActual);

  const handleSetCurrent = async (period: AcademicPeriod) => {
    setLoading(period.idPeriodoAcademico);
    try {
      const result = await setCurrentAcademicPeriod(period.idPeriodoAcademico);
      toast.success(result.mensaje);
      onUpdate();
    } catch (error) {
      toast.error("Error al marcar periodo como actual");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDateInRange = (fechaInicio: string, fechaFin: string) => {
    const now = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return now >= inicio && now <= fin;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Periodo Académico Actual
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona el periodo activo para inscripciones
          </p>
        </div>
      </div>

      {!currentPeriod && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>¡Atención!</strong> No hay ningún periodo marcado como actual.
            Las inscripciones podrían fallar. Por favor, selecciona un periodo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        {periods.map((period) => {
          const isActive = period.esPeriodoActual;
          const isInDateRange = isDateInRange(period.fechaInicio, period.fechaFin);

          return (
            <div
              key={period.idPeriodoAcademico}
              className={`p-4 border rounded-lg transition-all ${
                isActive
                  ? "bg-green-50 border-green-300 shadow-sm"
                  : "bg-white hover:border-gray-400"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-lg">{period.nombre}</span>
                    {isActive && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="w-3 h-3 mr-1" />
                        Actual
                      </Badge>
                    )}
                    {isInDateRange && !isActive && (
                      <Badge variant="outline" className="border-blue-500 text-blue-700">
                        En vigencia
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Clave:</span>
                      <span>{period.clave}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(period.fechaInicio)} - {formatDate(period.fechaFin)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Periodicidad:</span>
                      <span>{period.periodicidad}</span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                      ✓ Este periodo está configurado como actual. Las inscripciones se realizarán
                      para este periodo.
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {!isActive && (
                    <Button
                      onClick={() => handleSetCurrent(period)}
                      disabled={loading === period.idPeriodoAcademico}
                      size="sm"
                      variant={isInDateRange ? "default" : "outline"}
                    >
                      {loading === period.idPeriodoAcademico ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Procesando...
                        </>
                      ) : (
                        "Marcar como Actual"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {periods.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay periodos académicos registrados. Crea uno para poder realizar inscripciones.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
