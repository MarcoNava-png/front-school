import type { DiaSemana } from "@/types/group";
import type {
  RegistroAsistencia,
  ResumenAsistencias,
  AsistenciaPorFecha,
  RegistrarAsistenciaRequest,
  ResumenGrupoMateriaAsistencias,
  AsistenciaEstudiante,
  ValidacionFechaClase,
  DiasClaseMateria,
} from "@/types/asistencia";

// ============================================================================
// VALIDACIÓN DE DÍAS DE CLASE
// ============================================================================

/**
 * Obtiene los días de clase de una materia según su horario
 * TODO: Habilitar llamada al backend cuando el endpoint esté implementado
 */
export async function getDiasClaseMateria(idGrupoMateria: number): Promise<DiasClaseMateria> {
  // TODO: Habilitar cuando el backend tenga los endpoints implementados
  // Por ahora usar mock directamente para evitar errores 404

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Mock: días de clase por defecto
  return {
    idGrupoMateria,
    nombreMateria: "Materia",
    diasSemana: ["Lunes", "Miércoles", "Viernes"],
    horarios: [
      { dia: "Lunes", horaInicio: "08:00", horaFin: "10:00", aula: "A-101" },
      { dia: "Miércoles", horaInicio: "08:00", horaFin: "10:00", aula: "A-101" },
      { dia: "Viernes", horaInicio: "08:00", horaFin: "10:00", aula: "A-101" },
    ],
  };
}

/**
 * Valida si una fecha es un día válido de clase para una materia
 */
export function validarFechaClase(
  fecha: string,
  diasClase: string[]
): ValidacionFechaClase {
  const fechaObj = new Date(fecha + "T00:00:00"); // Evitar problemas de timezone
  const diasSemana: DiaSemana[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaSemanaNombre = diasSemana[fechaObj.getDay()];

  const esDiaDeClase = diasClase.includes(diaSemanaNombre);

  return {
    esFechaValida: true,
    esDiaDeClase,
    diaSemanaNombre,
    mensaje: esDiaDeClase
      ? `${diaSemanaNombre} es un día de clase válido`
      : `${diaSemanaNombre} NO es un día de clase. Los días de clase son: ${diasClase.join(", ")}`,
  };
}

// ============================================================================
// REGISTRO DE ASISTENCIAS
// ============================================================================

/**
 * Registra o actualiza asistencias para una fecha específica
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function registrarAsistencias(request: RegistrarAsistenciaRequest): Promise<void> {
  // Mock: simular éxito
  console.log("[Mock] Registrando asistencias:", request);
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Obtiene asistencias de un grupo-materia para una fecha específica
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function getAsistenciasPorFecha(
  idGrupoMateria: number,
  fecha: string
): Promise<AsistenciaEstudiante[]> {
  // Usar mock mientras el backend no tenga el endpoint
  // Descomentar cuando esté implementado:
  // const { data } = await apiClient.get<AsistenciaEstudiante[]>(
  //   `/asistencias/grupo-materia/${idGrupoMateria}/fecha/${fecha}`
  // );
  // return data;
  return getAsistenciasPorFechaMock(idGrupoMateria, fecha);
}

/**
 * Obtiene todas las fechas con asistencias registradas para un grupo-materia
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function getFechasConAsistencias(idGrupoMateria: number): Promise<string[]> {
  // Mock: devolver algunas fechas de ejemplo
  return [
    "2025-11-18",
    "2025-11-20",
    "2025-11-22",
  ];
}

// ============================================================================
// RESÚMENES Y ESTADÍSTICAS
// ============================================================================

/**
 * Obtiene el resumen de asistencias de todos los estudiantes de un grupo-materia
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function getResumenAsistencias(idGrupoMateria: number): Promise<ResumenAsistencias[]> {
  // Usar mock mientras el backend no tenga el endpoint
  return getResumenAsistenciasMock(idGrupoMateria);
}

/**
 * Obtiene el resumen de asistencias de un estudiante específico
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function getResumenAsistenciasEstudiante(
  idEstudiante: number,
  idGrupoMateria?: number
): Promise<ResumenAsistencias[]> {
  // Mock: devolver datos de ejemplo para el estudiante
  return [
    {
      idEstudiante,
      matricula: `2024${String(idEstudiante).padStart(3, '0')}`,
      nombreCompleto: "Estudiante de Prueba",
      totalClases: 20,
      asistencias: 18,
      faltas: 2,
      faltasJustificadas: 1,
      faltasInjustificadas: 1,
      porcentajeAsistencia: 90,
      alerta: false,
    },
  ];
}

/**
 * Obtiene el resumen de un grupo-materia (estadísticas generales)
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function getResumenGrupoMateria(idGrupoMateria: number): Promise<ResumenGrupoMateriaAsistencias> {
  // Mock: devolver estadísticas de ejemplo
  return {
    idGrupoMateria,
    nombreMateria: "Materia de ejemplo",
    grupo: "A",
    periodoAcademico: "2024-1",
    totalEstudiantes: 25,
    clasesRegistradas: 20,
    promedioAsistencia: 85,
    estudiantesConAlerta: 3,
  };
}

// ============================================================================
// JUSTIFICACIONES
// ============================================================================

/**
 * Justifica una falta específica
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function justificarFalta(
  idAsistencia: number,
  motivo: string
): Promise<void> {
  // Mock: simular éxito
  console.log(`[Mock] Justificando falta ${idAsistencia}: ${motivo}`);
  await new Promise(resolve => setTimeout(resolve, 300));
}

/**
 * Obtiene estudiantes con alertas de asistencia (>20% faltas)
 * TODO: Habilitar cuando el backend tenga el endpoint implementado
 */
export async function getEstudiantesConAlerta(idGrupoMateria: number): Promise<ResumenAsistencias[]> {
  // Mock: usar la función mock y filtrar los que tienen alerta
  const resumen = await getResumenAsistenciasMock(idGrupoMateria);
  return resumen.filter(r => r.alerta);
}

// ============================================================================
// MOCK DATA (mientras se implementa el backend)
// ============================================================================

/**
 * Función mock para obtener asistencias por fecha
 * TODO: Reemplazar con API real cuando esté disponible
 */
export async function getAsistenciasPorFechaMock(
  idGrupoMateria: number,
  fecha: string
): Promise<AsistenciaEstudiante[]> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Datos mock
  return [
    {
      idInscripcion: 1,
      idEstudiante: 1,
      matricula: "2024001",
      nombreCompleto: "Juan Pérez Gómez",
      presente: true,
      justificada: false,
      horaRegistro: "08:30:00",
    },
    {
      idInscripcion: 2,
      idEstudiante: 2,
      matricula: "2024002",
      nombreCompleto: "María López García",
      presente: false,
      justificada: true,
      motivoJustificacion: "Cita médica",
      horaRegistro: "08:30:00",
    },
    {
      idInscripcion: 3,
      idEstudiante: 3,
      matricula: "2024003",
      nombreCompleto: "Carlos Ruiz Hernández",
      presente: true,
      justificada: false,
      horaRegistro: "08:35:00",
    },
    {
      idInscripcion: 4,
      idEstudiante: 4,
      matricula: "2024004",
      nombreCompleto: "Ana Martínez Silva",
      presente: null, // No registrado aún
      justificada: false,
    },
    {
      idInscripcion: 5,
      idEstudiante: 5,
      matricula: "2024005",
      nombreCompleto: "Luis García Torres",
      presente: false,
      justificada: false,
      horaRegistro: "08:30:00",
    },
  ];
}

/**
 * Función mock para obtener resumen de asistencias
 * TODO: Reemplazar con API real cuando esté disponible
 */
export async function getResumenAsistenciasMock(idGrupoMateria: number): Promise<ResumenAsistencias[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      idEstudiante: 1,
      matricula: "2024001",
      nombreCompleto: "Juan Pérez Gómez",
      totalClases: 20,
      asistencias: 18,
      faltas: 2,
      faltasJustificadas: 1,
      faltasInjustificadas: 1,
      porcentajeAsistencia: 90,
      alerta: false,
    },
    {
      idEstudiante: 2,
      matricula: "2024002",
      nombreCompleto: "María López García",
      totalClases: 20,
      asistencias: 19,
      faltas: 1,
      faltasJustificadas: 1,
      faltasInjustificadas: 0,
      porcentajeAsistencia: 95,
      alerta: false,
    },
    {
      idEstudiante: 3,
      matricula: "2024003",
      nombreCompleto: "Carlos Ruiz Hernández",
      totalClases: 20,
      asistencias: 14,
      faltas: 6,
      faltasJustificadas: 2,
      faltasInjustificadas: 4,
      porcentajeAsistencia: 70,
      alerta: true, // >20% de faltas
    },
    {
      idEstudiante: 4,
      matricula: "2024004",
      nombreCompleto: "Ana Martínez Silva",
      totalClases: 20,
      asistencias: 17,
      faltas: 3,
      faltasJustificadas: 2,
      faltasInjustificadas: 1,
      porcentajeAsistencia: 85,
      alerta: false,
    },
    {
      idEstudiante: 5,
      matricula: "2024005",
      nombreCompleto: "Luis García Torres",
      totalClases: 20,
      asistencias: 12,
      faltas: 8,
      faltasJustificadas: 1,
      faltasInjustificadas: 7,
      porcentajeAsistencia: 60,
      alerta: true, // >20% de faltas
    },
  ];
}
