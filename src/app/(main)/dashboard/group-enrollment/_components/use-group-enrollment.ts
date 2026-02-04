import { useEffect, useState } from "react";

import { toast } from "sonner";

import { getAcademicPeriods, getStudyPlans } from "@/services/catalogs-service";
import { enrollStudentInGroup, searchGroups } from "@/services/groups-service";
import { getStudentsWithoutGroup } from "@/services/students-service";
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
  const [showAlreadyInGroupModal, setShowAlreadyInGroupModal] = useState(false);
  const [alreadyInGroupInfo, setAlreadyInGroupInfo] = useState<{ studentName: string; groupCode: string } | null>(null);

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
      const [plansData, periodsData] = await Promise.all([
        getStudyPlans(),
        getAcademicPeriods(),
      ]);

      setStudyPlans(plansData);
      setAcademicPeriods(periodsData);

      const activePeriod = periodsData.find((p) => p.status === 1 || p.esPeriodoActual);
      if (activePeriod) {
        setSelectedPeriodId(activePeriod.idPeriodoAcademico.toString());
      }

      toast.success(`Cargados: ${plansData.length} planes, ${periodsData.length} periodos`);
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadAvailableGroups = async () => {
    if (!selectedPlanId || !selectedPeriodId) return;

    setLoading(true);
    try {
      const [groups, studentsData] = await Promise.all([
        searchGroups({
          idPlanEstudios: parseInt(selectedPlanId),
          numeroCuatrimestre: parseInt(cuatrimestreFilter),
        }),
        getStudentsWithoutGroup(
          parseInt(selectedPlanId),
          parseInt(selectedPeriodId)
        ),
      ]);
      setAvailableGroups(groups);
      setStudents(studentsData.items ?? []);
    } catch (error) {
      toast.error("Error al cargar los datos");
      setAvailableGroups([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshStudentsAfterEnrollment = async (enrolledStudentId?: number) => {
    if (enrolledStudentId) {
      setStudents(prevStudents => prevStudents.filter(s => s.idEstudiante !== enrolledStudentId));
      setSelectedStudentId(null);
    } else if (selectedPlanId && selectedPeriodId) {
      const studentsData = await getStudentsWithoutGroup(
        parseInt(selectedPlanId),
        parseInt(selectedPeriodId)
      );
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

    try {
      const result = await enrollStudentInGroup(idGrupo, {
        idEstudiante: selectedStudentId,
        forzarInscripcion: forceEnroll,
      });

      setEnrollmentResult(result);
      setShowResultModal(true);

      const isFullSuccess = result.materiasInscritas === result.totalMaterias;
      if (isFullSuccess) {
        toast.success(`Estudiante inscrito exitosamente al grupo ${codigoGrupo}`);
        await refreshStudentsAfterEnrollment(selectedStudentId);
      } else {
        toast.warning(`Inscripción parcial: ${result.materiasInscritas}/${result.totalMaterias} materias`);
        await refreshStudentsAfterEnrollment(selectedStudentId);
      }
    } catch (error: unknown) {
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

        errorMessage =
          errorData?.Error ||
          errorData?.error ||
          errorData?.mensaje ||
          errorData?.Message ||
          "Error en la solicitud de inscripción";

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
      } else if (err?.response?.data?.Error) {
        errorMessage = err.response.data.Error;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.mensaje) {
        errorMessage = err.response.data.mensaje;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      const isAlreadyInGroup =
        errorMessage.toLowerCase().includes("ya está inscrito en el grupo") ||
        errorMessage.toLowerCase().includes("ya inscrito en el grupo") ||
        errorMessage.toLowerCase().includes("estudiante ya pertenece") ||
        errorMessage.toLowerCase().includes("ya pertenece al grupo");

      if (isAlreadyInGroup) {
        setAlreadyInGroupInfo({
          studentName: student?.nombreCompleto ?? "Estudiante",
          groupCode: codigoGrupo,
        });
        setShowAlreadyInGroupModal(true);
        return;
      }

      const canForceEnroll =
        errorMessage.toLowerCase().includes("cupo") ||
        errorMessage.toLowerCase().includes("lleno") ||
        errorMessage.toLowerCase().includes("ya está inscrito") ||
        errorMessage.toLowerCase().includes("ya inscrito") ||
        errorMessage.toLowerCase().includes("plan") ||
        errorMessage.toLowerCase().includes("recibo") ||
        errorMessage.toLowerCase().includes("pendiente") ||
        errorMessage.toLowerCase().includes("pago") ||
        err?.response?.status === 400;

      if (canForceEnroll && !forceEnroll) {
        setPendingEnrollment({ idGrupo, codigoGrupo });
        setShowForceEnrollDialog(true);
        toast.warning(errorMessage, { duration: 6000 });
      } else {
        const fullMessage = errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage;
        toast.error(fullMessage, { duration: 8000 });
      }
    } finally {
      setEnrolling(false);
      setEnrollingGroupId(null);
    }
  };

  const handleEnrollStudent = async (idGrupo: number, codigoGrupo: string) => {
    if (enrolling || enrollingGroupId !== null) {
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

    if (!student?.idPlanActual) {
      toast.error(
        "El estudiante no tiene plan de estudios asignado. Por favor, asígnalo desde el módulo de Estudiantes primero.",
        { duration: 5000 }
      );
      return;
    }

    if (student.idPlanActual.toString() !== selectedPlanId) {
      toast.error(
        `El estudiante está inscrito en un plan diferente. Plan actual: ${student.planEstudios}`,
        { duration: 5000 }
      );
      return;
    }

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

  return {
    students,
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
    showAlreadyInGroupModal,
    setShowAlreadyInGroupModal,
    alreadyInGroupInfo,
  };
}
