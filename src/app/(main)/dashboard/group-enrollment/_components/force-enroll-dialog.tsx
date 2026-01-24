"use client";

import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ForceEnrollDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  studentName?: string;
  groupCode?: string;
}

export function ForceEnrollDialog({
  open,
  onConfirm,
  onCancel,
  studentName,
  groupCode,
}: ForceEnrollDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            ¿Forzar inscripción?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <p className="text-base text-gray-700">
                La inscripción normal no pudo completarse debido a restricciones del sistema.
              </p>

              {studentName && groupCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-blue-900">Detalles:</p>
                  <p className="text-blue-800">
                    <span className="font-medium">Estudiante:</span> {studentName}
                  </p>
                  <p className="text-blue-800">
                    <span className="font-medium">Grupo:</span> {groupCode}
                  </p>
                </div>
              )}

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="font-semibold text-orange-900 text-sm mb-2">
                  Esto puede deberse a:
                </p>
                <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                  <li>El estudiante tiene recibos pendientes de pago</li>
                  <li>El estudiante ya está inscrito en alguna materia del grupo</li>
                  <li>No hay cupo disponible en una o más materias</li>
                  <li>El plan de estudios del estudiante es diferente al del grupo</li>
                  <li>El periodo académico no está activo</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-900 text-sm mb-1">
                  Advertencia
                </p>
                <p className="text-sm text-red-800">
                  Al forzar la inscripción, se omitirán las validaciones normales del sistema.
                  Solo procede si estás seguro de que esta acción es necesaria y válida.
                </p>
              </div>

              <p className="text-sm text-gray-600 font-medium">
                ¿Deseas continuar y forzar la inscripción de este estudiante?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            Sí, forzar inscripción
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
