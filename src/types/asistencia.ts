export interface AsistenciaEstudiante {
  idAsistencia?: number;
  idInscripcion: number;
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  presente: boolean | null;
  justificada: boolean;
  motivoJustificacion?: string;
  horaRegistro?: string;
}

export interface RegistroAsistencia {
  idAsistencia: number;
  idGrupoMateria: number;
  idInscripcion: number;
  fecha: string;
  presente: boolean;
  justificada: boolean;
  motivoJustificacion?: string;
  registradoPor: string;
  fechaRegistro: string;
}

export interface ResumenAsistencias {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  totalClases: number;
  asistencias: number;
  faltas: number;
  faltasJustificadas: number;
  faltasInjustificadas: number;
  porcentajeAsistencia: number;
  alerta: boolean;
}

export interface AsistenciaPorFecha {
  fecha: string;
  estudiantes: AsistenciaEstudiante[];
  totalPresentes: number;
  totalAusentes: number;
  totalNoRegistrados: number;
  porcentajeAsistencia: number;
}

export interface ConfiguracionAsistencia {
  idGrupoMateria: number;
  nombreMateria: string;
  grupo: string;
  limitePorcentajeFaltas: number;
  totalClasesEsperadas: number;
  clasesRegistradas: number;
}

export interface RegistrarAsistenciaRequest {
  idGrupoMateria: number;
  fecha: string;
  asistencias: {
    idInscripcion: number;
    presente: boolean;
    justificada: boolean;
    motivoJustificacion?: string;
  }[];
}

export interface ResumenGrupoMateriaAsistencias {
  idGrupoMateria: number;
  nombreMateria: string;
  grupo: string;
  periodoAcademico: string;
  totalEstudiantes: number;
  clasesRegistradas: number;
  promedioAsistencia: number;
  estudiantesConAlerta: number;
  ultimaClase?: string;
}

export interface ValidacionFechaClase {
  esFechaValida: boolean;
  esDiaDeClase: boolean;
  mensaje: string;
  diaSemanaNombre: string;
}

export interface DiasClaseMateria {
  idGrupoMateria: number;
  nombreMateria: string;
  diasSemana: string[];
  horarios: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
    aula: string;
  }>;
}
