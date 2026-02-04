"use client";

import { useState } from "react";

import { BookOpen, Calendar, Search, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { EnrollGrupoMateriaModal } from "../students/_components/enroll-grupomateria-modal";

import { InscriptionsList } from "./_components/inscriptions-list";
import { StudentInfoCard } from "./_components/student-info-card";
import { StudentSearch } from "./_components/student-search";
import { useInscriptions } from "./_components/use-inscriptions";

export default function InscriptionsPage() {
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const {
    academicPeriods,
    selectedStudentId,
    setSelectedStudentId,
    selectedPeriodId,
    setSelectedPeriodId,
    searchTerm,
    setSearchTerm,
    showSearchResults,
    setShowSearchResults,
    loading,
    loadInscriptions,
    filteredStudents,
    selectedStudent,
    filteredInscriptions,
  } = useInscriptions();

  const handleSelectStudent = (studentId: string, matricula: string) => {
    setSelectedStudentId(studentId);
    setSearchTerm(matricula);
  };

  const handleEnrollmentSuccess = () => {
    loadInscriptions();
    toast.success("Inscripción exitosa");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inscripciones de Estudiantes</h1>
          <p className="text-gray-600 text-sm mt-1">Gestiona las inscripciones a grupos-materias</p>
        </div>
        {selectedStudentId && (
          <Button onClick={() => setEnrollModalOpen(true)} className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Nueva Inscripción
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
        <StudentSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filteredStudents={filteredStudents}
          showResults={showSearchResults}
          onShowResultsChange={setShowSearchResults}
          onSelectStudent={handleSelectStudent}
          selectedStudent={selectedStudent}
        />

        <div className="space-y-2">
          <Label htmlFor="period" className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Periodo Académico
          </Label>
          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Todos los periodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los periodos</SelectItem>
              {academicPeriods.map((period) => (
                <SelectItem key={period.idPeriodoAcademico} value={period.idPeriodoAcademico.toString()}>
                  {period.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col justify-end">
          <Button
            onClick={loadInscriptions}
            disabled={!selectedStudentId || loading}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Search className="w-4 h-4" />
            {loading ? "Buscando..." : "Buscar Inscripciones"}
          </Button>
        </div>
      </div>

      {selectedStudent && <StudentInfoCard student={selectedStudent} inscriptionsCount={filteredInscriptions.length} />}

      {selectedStudentId ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Carga Académica</h2>
          <InscriptionsList inscriptions={filteredInscriptions} loading={loading} />
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Selecciona un estudiante</p>
          <p className="text-gray-500 text-sm mt-1">Elige un estudiante del filtro superior para ver sus inscripciones</p>
        </div>
      )}

      <EnrollGrupoMateriaModal
        open={enrollModalOpen}
        studentId={selectedStudentId ? parseInt(selectedStudentId) : null}
        studentName={selectedStudent?.nombreCompleto}
        onClose={() => setEnrollModalOpen(false)}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
}
