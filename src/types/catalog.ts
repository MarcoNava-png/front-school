export interface Genres {
  idGenero: number;
  descGenero: string;
  persona: [string];
}

export interface Schedule {
  idTurno: number;
  clave: string;
  nombre: string;
  grupo: [];
}

export interface WeekDay {
  idDiaSemana: number;
  nombre: string;
  horario: [];
}

export interface CivilStatus {
  idEstadoCivil: number;
  descEstadoCivil: string;
  persona: [];
}

export interface ApplicantStatus {
  idAspiranteEstatus: number;
  descEstatus: string;
  aspirante: [];
  createdAt: string;
  updatedAt: null;
  createdBy: string;
  updatedBy: null;
  status: number;
}

export interface ContactMethod {
  idMedioContacto: number;
  descMedio: string;
  activo: boolean;
  aspirante: [];
  createdAt: string;
  updatedAt: null;
  createdBy: string;
  updatedBy: null;
  status: number;
}

export interface EducationLevel {
  idNivelEducativo: number;
  descNivelEducativo: string;
  activo: boolean;
  planEstudios: [];
}

export interface Periodicity {
  idPeriodicidad: number;
  descPeriodicidad: string;
  periodosPorAnio: number;
  mesesPorPeriodo: number;
  activo: boolean;
  periodoAcademico: [];
  planEstudios: [];
}

export interface PaymentMethod {
  idMedioPago: number;
  clave: string;
  descripcion?: string;
  activo: boolean;
}

export interface AcademicPeriod {
  idPeriodoAcademico: number;
  clave: string;
  nombre: string;
  idPeriodicidad: number;
  fechaInicio: string;
  fechaFin: string;
  status: number;
  esPeriodoActual?: boolean;
}

export interface StudyPlan {
  idPlanEstudios: number;
  clavePlanEstudios: string;
  nombrePlanEstudios: string;
  rvoe?: string;
  permiteAdelantar?: boolean;
  version?: string;
  duracionMeses?: number;
  minimaAprobatoriaParcial?: number;
  minimaAprobatoriaFinal?: number;
  periodicidad?: string;
  idPeriodicidad: number;
  idNivelEducativo: number;
  idCampus?: number;
  activo?: boolean;
}

export interface Grupo {
  idGrupo: number;
  codigoGrupo: string;
  numeroCuatrimestre: number;
  idTurno: number;
  numeroGrupo: number;
  idPeriodoAcademico: number;
  idPlanEstudios: number;
  cupo: number;
}

// Alias for Schedule (Turno)
export type Turno = Schedule;
