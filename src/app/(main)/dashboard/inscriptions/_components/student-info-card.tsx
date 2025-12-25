"use client";

import { GraduationCap } from "lucide-react";

import { Student } from "@/types/student";

interface StudentInfoCardProps {
  student: Student;
  inscriptionsCount: number;
}

export function StudentInfoCard({ student, inscriptionsCount }: StudentInfoCardProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-blue-600 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">{student.nombreCompleto}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-blue-800">
            <div>
              <span className="font-medium">Matrícula:</span> {student.matricula}
            </div>
            <div>
              <span className="font-medium">Plan:</span> {student.planEstudios}
            </div>
            {student.email && (
              <div>
                <span className="font-medium">Email:</span> {student.email}
              </div>
            )}
            {student.telefono && (
              <div>
                <span className="font-medium">Teléfono:</span> {student.telefono}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{inscriptionsCount}</div>
          <div className="text-xs text-blue-700">Inscripciones</div>
        </div>
      </div>
    </div>
  );
}
