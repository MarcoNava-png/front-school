import { PaginatedResponse } from "@/types/paginated-response";

export interface Group {
  idGrupo: number;
  nombreGrupo: string;
  idPlanEstudios: number;
  planEstudios: string;
  periodoAcademico: string;
  consecutivoPeriodicidad: number;
  numeroGrupo: number;
  turno: string;
  capacidadMaxima: number;
  codigoGrupo: string; // Formato: {CUATRIMESTRE}{TURNO}{NUMERO_GRUPO} ej: "111", "122"
  grupoMateria: Array<any>;
  estudiantesInscritos?: number; // Número de estudiantes inscritos en el grupo
}

export interface PayloadCreateGroup {
  idPlanEstudios: number;
  idPeriodoAcademico: number;
  numeroCuatrimestre: number;
  numeroGrupo: number;
  idTurno: number;
  capacidadMaxima: number;
}

export interface PayloadUpdateGroup extends PayloadCreateGroup {
  idGrupo: number;
  status: number;
}

export interface PayloadAddMatters {
  idGrupo: number;
  grupoMaterias: Array<{
    idMateriaPlan: number;
    idProfesor: number;
    aula: string;
    cupo: number;
  }>;
}

export type GroupsResponse = PaginatedResponse<Group>;

// ============================================================================
// INSCRIPCIÓN A GRUPO
// ============================================================================

export interface EnrollStudentInGroupRequest {
  idEstudiante: number;
  forzarInscripcion?: boolean;
  observaciones?: string;
}

export interface GroupEnrollmentResult {
  idGrupo: number;
  codigoGrupo: string;
  nombreGrupo: string;
  idEstudiante: number;
  matriculaEstudiante: string;
  nombreEstudiante: string;
  totalMaterias: number;
  materiasInscritas: number;
  materiasFallidas: number;
  detalleInscripciones: SubjectEnrollmentDetail[];
  validaciones: GroupEnrollmentValidation;
  fechaInscripcion: string;
  inscripcionForzada: boolean;
  observaciones?: string;
}

export interface SubjectEnrollmentDetail {
  idInscripcion?: number;
  idGrupoMateria: number;
  nombreMateria: string;
  profesor?: string;
  aula?: string;
  cupoMaximo: number;
  estudiantesInscritos: number;
  exitoso: boolean;
  mensajeError?: string;
}

export interface GroupEnrollmentValidation {
  estudianteActivo: boolean;
  planEstudiosCompatible: boolean;
  periodoActivo: boolean;
  pagosAlCorriente: boolean; // NUEVO: Validación de pagos pendientes
  cuposDisponibles: boolean;
  sinDuplicados: boolean;
  advertencias: string[];
}

// ============================================================================
// ESTUDIANTES EN GRUPO
// ============================================================================

export interface StudentsInGroup {
  idGrupo: number;
  codigoGrupo: string;
  nombreGrupo: string;
  totalEstudiantes: number;
  estudiantes: StudentInGroup[];
}

export interface StudentInGroup {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  planEstudios?: string;
  idInscripcion?: number;
  materiasInscritas: number;
  fechaInscripcion: string;
  estado?: string;
}

// ============================================================================
// GESTIÓN ACADÉMICA DE GRUPOS
// ============================================================================

export interface GestionAcademicaResponse {
  idPlanEstudios: number;
  nombrePlan: string;
  duracionCuatrimestres: number;
  gruposPorCuatrimestre: GruposPorCuatrimestre[];
}

export interface GruposPorCuatrimestre {
  numeroCuatrimestre: number;
  grupos: GrupoResumen[];
}

export interface GrupoResumen {
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo: string;
  turno: string;
  periodoAcademico: string;
  totalEstudiantes: number;
  capacidadMaxima: number;
  totalMaterias: number;
  idPlanEstudios?: number; // NUEVO: ID del plan de estudios del grupo
}

export interface GrupoConMaterias extends GrupoResumen {
  numeroCuatrimestre: number;
  materias: GrupoMateria[];
}

export interface CreateGroupWithSubjectsRequest {
  idPlanEstudios: number;
  idPeriodoAcademico: number;
  numeroCuatrimestre: number;
  numeroGrupo: number;
  idTurno: number;
  capacidadMaxima: number;
  cargarMateriasAutomaticamente: boolean;
}

export interface CreateGroupWithSubjectsResponse {
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo: string;
  materiasAgregadas: number;
  mensaje: string;
}

// ============================================================================
// HORARIOS
// ============================================================================

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export interface HorarioMateria {
  dia: DiaSemana;
  horaInicio: string; // Formato "HH:mm" ej: "08:00"
  horaFin: string; // Formato "HH:mm" ej: "10:00"
  aula: string;
}

export interface GrupoMateria {
  idGrupoMateria: number;
  idMateriaPlan: number;
  nombreMateria: string;
  claveMateria: string;
  creditos: number;
  idProfesor?: number;
  nombreProfesor?: string;
  aula?: string;
  cupo: number;
  inscritos: number;
  disponibles: number;

  // NUEVO: Gestión completa de horarios
  horarioJson?: HorarioMateria[]; // Array de horarios por semana
  diasSemana?: string; // "Lunes, Miércoles, Viernes" (legacy, para mostrar)
  horaInicio?: string; // Hora de inicio general (legacy)
  horaFin?: string; // Hora de fin general (legacy)
  horario?: string; // Texto descriptivo completo (legacy)

  // Propiedades alternativas del backend (camelCase vs PascalCase)
  estudiantesInscritos?: number;
  cupoDisponible?: number;
}

export interface AddSubjectToGroupRequest {
  idMateriaPlan: number;
  idProfesor?: number;
  aula?: string;
  cupo: number;
  horarioJson?: HorarioMateria[]; // NUEVO: Array de horarios estructurados
}

export interface PromocionRequest {
  idGrupoActual: number;
  idPeriodoAcademicoDestino: number;
  crearGrupoSiguienteAutomaticamente: boolean;
  promedioMinimoPromocion?: number;
  promoverTodos: boolean;
}

export interface PromocionResponse {
  grupoOrigen: string;
  grupoDestino: string;
  totalEstudiantesPromovidos: number;
  totalEstudiantesNoPromovidos: number;
  estudiantes: EstudiantePromocionDetalle[];
}

export interface EstudiantePromocionDetalle {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  fuePromovido: boolean;
  motivo: string;
  promedioGeneral: number;
}
