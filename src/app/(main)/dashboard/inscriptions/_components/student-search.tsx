"use client";

import { User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student } from "@/types/student";

interface StudentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredStudents: Student[];
  showResults: boolean;
  onShowResultsChange: (show: boolean) => void;
  onSelectStudent: (studentId: string, matricula: string) => void;
  selectedStudent?: Student;
}

export function StudentSearch({
  searchTerm,
  onSearchChange,
  filteredStudents,
  showResults,
  onShowResultsChange,
  onSelectStudent,
  selectedStudent,
}: StudentSearchProps) {
  return (
    <div className="space-y-2 relative">
      <Label htmlFor="student" className="text-sm font-semibold flex items-center gap-2">
        <User className="w-4 h-4" />
        Estudiante
      </Label>
      <div className="relative search-results-container">
        <Input
          placeholder="Buscar por nombre o matrícula..."
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onShowResultsChange(true);
          }}
          onFocus={() => onShowResultsChange(true)}
          className="text-sm"
        />
        {showResults && searchTerm && filteredStudents.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredStudents.slice(0, 50).map((student) => (
              <button
                key={student.idEstudiante}
                type="button"
                onClick={() => {
                  onSelectStudent(student.idEstudiante.toString(), student.matricula ?? "");
                  onShowResultsChange(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
              >
                <div className="font-medium">{student.matricula}</div>
                <div className="text-xs text-gray-600">{student.nombreCompleto}</div>
              </button>
            ))}
          </div>
        )}
        {showResults && searchTerm && filteredStudents.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-3 text-sm text-gray-500 text-center">
            No se encontraron estudiantes
          </div>
        )}
      </div>
      {selectedStudent && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
          <div className="font-semibold text-blue-900">{selectedStudent.nombreCompleto}</div>
          <div className="text-blue-700">{selectedStudent.planEstudios}</div>
        </div>
      )}
    </div>
  );
}
