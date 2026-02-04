"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroupEnrollmentResult } from "@/types/group";

interface EnrollmentResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: GroupEnrollmentResult;
}

export function EnrollmentResultModal({ open, onOpenChange, result }: EnrollmentResultModalProps) {
  const isFullSuccess = result.materiasInscritas === result.totalMaterias;
  const hasFailures = result.materiasFallidas > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isFullSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            )}
            Resultado de Inscripción
          </DialogTitle>
          <DialogDescription>
            Grupo {result.codigoGrupo} - {result.nombreGrupo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-900">{result.nombreEstudiante}</p>
            <p className="text-sm text-blue-700">Matrícula: {result.matriculaEstudiante}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{result.totalMaterias}</p>
              <p className="text-sm text-gray-600">Total Materias</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-900">{result.materiasInscritas}</p>
              <p className="text-sm text-green-700">Inscritas</p>
            </div>
            {hasFailures && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-900">{result.materiasFallidas}</p>
                <p className="text-sm text-red-700">Fallidas</p>
              </div>
            )}
          </div>
          {result.validaciones.advertencias.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-900 mb-2">Advertencias:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                {result.validaciones.advertencias.map((adv, idx) => (
                  <li key={idx}>{adv}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-2">
            <p className="font-semibold">Detalle de Materias:</p>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {result.detalleInscripciones.map((detalle, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    detalle.exitoso
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{detalle.nombreMateria}</p>
                      {detalle.profesor && (
                        <p className="text-sm text-gray-600">Profesor: {detalle.profesor}</p>
                      )}
                      {detalle.aula && <p className="text-xs text-gray-500">Aula: {detalle.aula}</p>}
                      {!detalle.exitoso && detalle.mensajeError && (
                        <p className="text-sm text-red-600 mt-1">{detalle.mensajeError}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      {detalle.exitoso ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        {detalle.estudiantesInscritos}/{detalle.cupoMaximo}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
