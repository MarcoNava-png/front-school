import { useEffect, useState } from "react";

import { toast } from "sonner";

import { getAcademicPeriods, getStudyPlans } from "@/services/catalogs-service";
import { enrollStudentInGroup, searchGroups } from "@/services/groups-service";
import { getStudentsList } from "@/services/students-service";
import { AcademicPeriod, StudyPlan } from "@/types/catalog";
import { Group, GroupEnrollmentResult } from "@/types/group";
import { Student } from "@/types/student";

export function useGroupEnrollment() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [cuatrimestreFilter, setCuatrimestreFilter] = useState<string>("1");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingGroupId, setEnrollingGroupId] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<GroupEnrollmentResult | null>(null);
  const [showForceEnrollDialog, setShowForceEnrollDialog] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState<{ idGrupo: number; codigoGrupo: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPlanId && selectedPeriodId) {
      loadAvailableGroups();
    }
  }, [selectedPlanId, selectedPeriodId, cuatrimestreFilter]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [studentsData, plansData, periodsData] = await Promise.all([
        getStudentsList(1, 1000),
        getStudyPlans(),
        getAcademicPeriods(),
      ]);

      console.log("📚 Planes de estudio cargados:", plansData);
      console.log("📅 Períodos académicos cargados:", periodsData);
      console.log("👨‍🎓 Estudiantes cargados:", studentsData);

      setStudents(studentsData.items ?? []);
      setStudyPlans(plansData);
      setAcademicPeriods(periodsData);

      const activePeriod = periodsData.find((p) => p.status === 1);
      if (activePeriod) {
        setSelectedPeriodId(activePeriod.idPeriodoAcademico.toString());
      }

      // Mensaje de confirmación
      toast.success(`Cargados: ${plansData.length} planes, ${periodsData.length} períodos, ${studentsData.items?.length ?? 0} estudiantes`);
    } catch (error) {
      console.error("❌ Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadAvailableGroups = async () => {
    setLoading(true);
    try {
      const groups = await searchGroups({
        idPlanEstudios: parseInt(selectedPlanId),
        numeroCuatrimestre: parseInt(cuatrimestreFilter),
      });
      setAvailableGroups(groups);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("Error al cargar los grupos");
      setAvailableGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshStudentsAfterEnrollment = async (enrolledStudentId?: number) => {
    // Si se proporciona el ID del estudiante inscrito, filtrarlo de la lista
    if (enrolledStudentId) {
      setStudents(prevStudents => prevStudents.filter(s => s.idEstudiante !== enrolledStudentId));
      setSelectedStudentId(null);
      console.log(`✅ Estudiante ${enrolledStudentId} removido de la lista local`);
    } else {
      // Si no, recargar toda la lista desde el servidor
      const studentsData = await getStudentsList(1, 1000);
      setStudents(studentsData.items ?? []);
      setSelectedStudentId(null);
    }
  };

  const performEnrollment = async (idGrupo: number, codigoGrupo: string, forceEnroll: boolean = false) => {
    const student = students.find((s) => s.idEstudiante === selectedStudentId);

    if (!student || !selectedStudentId) {
      toast.error("No se encontró la información del estudiante seleccionado");
      return;
    }

    setEnrolling(true);
    setEnrollingGroupId(idGrupo);

    console.log(`🎯 Iniciando inscripción al grupo ${idGrupo} (${codigoGrupo})`);
    console.log(`👤 Estudiante: ${student.nombreCompleto} (ID: ${selectedStudentId})`);
    console.log(`⚡ Forzar inscripción: ${forceEnroll}`);

    try {
      const result = await enrollStudentInGroup(idGrupo, {
        idEstudiante: selectedStudentId,
        forzarInscripcion: forceEnroll,
      });

      console.log("✅ Respuesta del servidor:", result);

      setEnrollmentResult(result);
      setShowResultModal(true);

      const isFullSuccess = result.materiasInscritas === result.totalMaterias;
      if (isFullSuccess) {
        toast.success(`Estudiante inscrito exitosamente al grupo ${codigoGrupo}`);
        // Refrescar la lista de estudiantes para quitar al inscrito
        await refreshStudentsAfterEnrollment(selectedStudentId);
      } else {
        toast.warning(`Inscripción parcial: ${result.materiasInscritas}/${result.totalMaterias} materias`);
        // También refrescar en caso de inscripción parcial
        await refreshStudentsAfterEnrollment(selectedStudentId);
      }
    } catch (error: unknown) {
      console.error("❌ Error al inscribir estudiante:", error);
      console.error("📋 Detalles completos del error:", JSON.stringify(error, null, 2));

      // Mejorar el manejo de errores
      const err = error as {
        response?: {
          data?: {
            Error?: string;
            error?: string;
            mensaje?: string;
            Message?: string;
          };
          status?: number
        };
        message?: string;
      };

      let errorMessage = "Error desconocido al inscribir estudiante";
      let errorDetails = "";

      if (err?.response?.status === 400) {
        const errorData = err.response.data;

        // Log completo para debugging
        console.error("💥 Error 400 detallado:", errorData);
        console.error("🔍 Tipo de errorData:", typeof errorData);
        console.error("🔍 Keys de errorData:", Object.keys(errorData || {}));

        errorMessage =
          errorData?.Error ||
          errorData?.error ||
          errorData?.mensaje ||
          errorData?.Message ||
          "Error en la solicitud de inscripción";

        // Proporcionar detalles específicos según el tipo de error
        if (errorMessage.toLowerCase().includes("transaction") || errorMessage.toLowerCase().includes("sql")) {
          errorDetails = "Error de base de datos. Por favor, contacta al administrador del sistema.";
        } else if (errorMessage.toLowerCase().includes("ya")) {
          errorDetails = "El estudiante ya está inscrito en alguna de las materias de este grupo.";
        } else if (errorMessage.toLowerCase().includes("plan")) {
          errorDetails = "El plan de estudios del estudiante no coincide con el del grupo.";
        }
      } else if (err?.response?.status === 500) {
        errorMessage = "Error interno del servidor";
        errorDetails = err?.response?.data?.Error || err?.response?.data?.error || "Por favor, intenta nuevamente o contacta al administrador.";
        console.error("💥 Error 500 detallado:", err.response.data);
      } else if (err?.response?.data?.Error) {
        errorMessage = err.response.data.Error;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.mensaje) {
        errorMessage = err.response.data.mensaje;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Verificar si es un error que puede solucionarse forzando la inscripción
      const canForceEnroll =
        errorMessage.toLowerCase().includes("cupo") ||
        errorMessage.toLowerCase().includes("lleno") ||
        errorMessage.toLowerCase().includes("ya está inscrito") ||
        errorMessage.toLowerCase().includes("ya inscrito") ||
        errorMessage.toLowerCase().includes("plan") ||
        err?.response?.status === 400;

      if (canForceEnroll && !forceEnroll) {
        // Mostrar diálogo para preguntar si quiere forzar la inscripción
        setPendingEnrollment({ idGrupo, codigoGrupo });
        setShowForceEnrollDialog(true);
        toast.warning("La inscripción no pudo completarse. ¿Deseas forzar la inscripción?", { duration: 5000 });
      } else {
        // Mostrar error con detalles si están disponibles
        const fullMessage = errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage;
        toast.error(fullMessage, { duration: 8000 });
      }
    } finally {
      setEnrolling(false);
      setEnrollingGroupId(null);
    }
  };

  const handleEnrollStudent = async (idGrupo: number, codigoGrupo: string) => {
    // Prevenir múltiples inscripciones simultáneas
    if (enrolling || enrollingGroupId !== null) {
      console.warn("⚠️ Intento de inscripción múltiple bloqueado");
      toast.warning("Ya hay una inscripción en proceso. Por favor espera.");
      return;
    }

    if (!selectedStudentId) {
      toast.error("Selecciona un estudiante primero");
      return;
    }

    if (!selectedPlanId) {
      toast.error("Selecciona un plan de estudios primero");
      return;
    }

    const student = students.find((s) => s.idEstudiante === selectedStudentId);

    if (!student) {
      toast.error("No se encontró la información del estudiante seleccionado");
      return;
    }

    // Validar si el estudiante necesita asignación de plan
    if (!student?.idPlanActual) {
      toast.error(
        "El estudiante no tiene plan de estudios asignado. Por favor, asígnalo desde el módulo de Estudiantes primero.",
        { duration: 5000 }
      );
      return;
    }

    // Validar que el plan del estudiante coincide con el plan seleccionado
    if (student.idPlanActual.toString() !== selectedPlanId) {
      toast.error(
        `El estudiante está inscrito en un plan diferente. Plan actual: ${student.planEstudios}`,
        { duration: 5000 }
      );
      return;
    }

    // Intentar inscripción normal primero
    await performEnrollment(idGrupo, codigoGrupo, false);
  };

  const handleForceEnrollConfirm = async () => {
    if (!pendingEnrollment) return;

    setShowForceEnrollDialog(false);
    await performEnrollment(pendingEnrollment.idGrupo, pendingEnrollment.codigoGrupo, true);
    setPendingEnrollment(null);
  };

  const handleForceEnrollCancel = () => {
    setShowForceEnrollDialog(false);
    setPendingEnrollment(null);
    toast.info("Inscripción cancelada");
  };

  const selectedStudent = students.find((s) => s.idEstudiante === selectedStudentId);
  const selectedPlan = studyPlans.find((p) => p.idPlanEstudios.toString() === selectedPlanId);

  // Filtrar estudiantes:
  // - Si NO hay plan seleccionado: mostrar estudiantes SIN plan (idPlanActual es null o undefined)
  // - Si HAY plan seleccionado: mostrar estudiantes con ese plan O sin plan
  const studentsWithoutGroup = students.filter((s) => {
    if (!selectedPlanId) {
      // Sin plan seleccionado: mostrar solo estudiantes sin plan
      return !s.idPlanActual;
    }
    // Con plan seleccionado: mostrar estudiantes con ese plan O sin plan
    return !s.idPlanActual || s.idPlanActual.toString() === selectedPlanId;
  });

  return {
    students: studentsWithoutGroup,
    studyPlans,
    academicPeriods,
    availableGroups,
    selectedPlanId,
    setSelectedPlanId,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedStudentId,
    setSelectedStudentId,
    cuatrimestreFilter,
    setCuatrimestreFilter,
    loading,
    initialLoading,
    enrolling,
    enrollingGroupId,
    showResultModal,
    setShowResultModal,
    enrollmentResult,
    selectedStudent,
    selectedPlan,
    loadAvailableGroups,
    handleEnrollStudent,
    showForceEnrollDialog,
    setShowForceEnrollDialog,
    handleForceEnrollConfirm,
    handleForceEnrollCancel,
    pendingEnrollment,
  };
}
