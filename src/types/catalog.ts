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
