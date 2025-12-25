"use client";

import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Student } from "@/types/student";

interface SelectedStudentBannerProps {
  selectedStudent: Student | undefined;
  onClearSelection: () => void;
}

export function SelectedStudentBanner({ selectedStudent, onClearSelection }: SelectedStudentBannerProps) {
  if (!selectedStudent) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <UserPlus className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-900">Estudiante seleccionado:</p>
          <p className="text-blue-800">
            {selectedStudent.matricula} - {selectedStudent.nombreCompleto}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClearSelection} className="ml-auto">
          Cambiar
        </Button>
      </div>
    </div>
  );
}
