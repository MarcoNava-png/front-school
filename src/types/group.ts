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
  codigoGrupo: string;
  grupoMateria: Array<any>;
  estudiantesInscritos?: number;
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
  pagosAlCorriente: boolean;
  cuposDisponibles: boolean;
  sinDuplicados: boolean;
  advertencias: string[];
}

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
  idPlanEstudios?: number;
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

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export interface HorarioMateria {
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
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

  horarioJson?: HorarioMateria[];
  diasSemana?: string;
  horaInicio?: string;
  horaFin?: string;
  horario?: string;

  estudiantesInscritos?: number;
  cupoDisponible?: number;
}

export interface AddSubjectToGroupRequest {
  idMateriaPlan: number;
  idProfesor?: number;
  aula?: string;
  cupo: number;
  horarioJson?: HorarioMateria[];
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
