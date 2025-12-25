import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { toast } from "sonner";

import { getAcademicPeriods } from "@/services/catalogs-service";
import { getStudentInscripciones, getStudentsList } from "@/services/students-service";
import { AcademicPeriod } from "@/types/catalog";
import { InscripcionGrupoMateriaResponse, Student } from "@/types/student";

export function useInscriptions() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [inscriptions, setInscriptions] = useState<InscripcionGrupoMateriaResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInitialData = async () => {
    try {
      const [studentsData, periodsData] = await Promise.all([getStudentsList(1, 1000), getAcademicPeriods()]);

      setStudents(studentsData.items ?? []);
      setAcademicPeriods(periodsData);

      const activePeriod = periodsData.find((p) => p.status === 1);
      if (activePeriod) {
        setSelectedPeriodId(activePeriod.idPeriodoAcademico.toString());
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    }
  };

  const loadInscriptions = async () => {
    if (!selectedStudentId) return;

    setLoading(true);
    try {
      const data = await getStudentInscripciones(parseInt(selectedStudentId));
      setInscriptions(data);
    } catch (error) {
      console.error("Error al cargar inscripciones:", error);
      toast.error("Error al cargar las inscripciones");
      setInscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const studentIdParam = searchParams.get("student");
    if (studentIdParam && students.length > 0) {
      setSelectedStudentId(studentIdParam);
    }
  }, [searchParams, students]);

  useEffect(() => {
    if (selectedStudentId) {
      loadInscriptions();
    }
  }, [selectedStudentId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-results-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = students.filter((s) => {
    const search = searchTerm.toLowerCase().trim();
    const nombre = s.nombreCompleto?.toLowerCase() || "";
    const matricula = s.matricula?.toLowerCase() || "";
    return nombre.includes(search) || matricula.includes(search);
  });

  const selectedStudent = students.find((s) => s.idEstudiante.toString() === selectedStudentId);

  const filteredInscriptions =
    selectedPeriodId && selectedPeriodId !== "all" ? inscriptions : inscriptions;

  return {
    students,
    academicPeriods,
    selectedStudentId,
    setSelectedStudentId,
    selectedPeriodId,
    setSelectedPeriodId,
    searchTerm,
    setSearchTerm,
    showSearchResults,
    setShowSearchResults,
    inscriptions,
    loading,
    loadInscriptions,
    filteredStudents,
    selectedStudent,
    filteredInscriptions,
  };
}
