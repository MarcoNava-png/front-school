"use client";

import { AlertCircle, Check, User, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/student";

interface StudentsWithoutGroupListProps {
  students: Student[];
  selectedStudentId: number | null;
  onSelectStudent: (id: number) => void;
  planName?: string;
}

export function StudentsWithoutGroupList({
  students,
  selectedStudentId,
  onSelectStudent,
  planName,
}: StudentsWithoutGroupListProps) {
  const studentsWithPlan = students.filter((s) => s.idPlanActual);
  const studentsWithoutPlan = students.filter((s) => !s.idPlanActual);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Estudiantes para Inscripción</h2>
        {planName && <p className="text-sm text-gray-600 mt-1">Plan: {planName}</p>}
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay estudiantes</p>
          <p className="text-gray-500 text-sm mt-1">Selecciona un plan de estudios para ver estudiantes</p>
        </div>
      ) : (
        <>
          {studentsWithoutPlan.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-800">
                    {studentsWithoutPlan.length} estudiante{studentsWithoutPlan.length !== 1 ? "s" : ""} sin plan
                  </p>
                  <p className="text-orange-700 text-xs mt-1">
                    Estos estudiantes necesitan que se les asigne un plan de estudios antes de inscribirlos a un grupo.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {students.map((student) => {
              const hasPlan = !!student.idPlanActual;
              return (
                <button
                  key={student.idEstudiante}
                  type="button"
                  onClick={() => onSelectStudent(student.idEstudiante)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedStudentId === student.idEstudiante
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : hasPlan
                        ? "bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                        : "bg-orange-50 border-orange-200 hover:border-orange-300"
                  }`}
                  disabled={!hasPlan}
                  title={!hasPlan ? "Este estudiante necesita un plan de estudios asignado" : undefined}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        selectedStudentId === student.idEstudiante
                          ? "bg-blue-100"
                          : hasPlan
                            ? "bg-gray-100"
                            : "bg-orange-100"
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 truncate">{student.nombreCompleto}</p>
                        {selectedStudentId === student.idEstudiante && (
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                        {!hasPlan && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                            Sin plan
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Matrícula: {student.matricula}</p>
                      {student.planEstudios && (
                        <p className="text-xs text-gray-500 truncate">Plan: {student.planEstudios}</p>
                      )}
                      {student.email && <p className="text-xs text-gray-500 truncate">{student.email}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {students.length > 0 && (
        <div className="pt-2 border-t space-y-1">
          <p className="text-sm text-gray-600">
            <strong>{studentsWithPlan.length}</strong> estudiante{studentsWithPlan.length !== 1 ? "s" : ""} listo
            {studentsWithPlan.length !== 1 ? "s" : ""} para inscribir
          </p>
          {studentsWithoutPlan.length > 0 && (
            <p className="text-sm text-orange-600">
              <strong>{studentsWithoutPlan.length}</strong> estudiante{studentsWithoutPlan.length !== 1 ? "s" : ""} sin
              plan asignado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
