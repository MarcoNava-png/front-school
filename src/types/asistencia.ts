// ============================================================================
// ASISTENCIAS - Control de Asistencia por Profesor
// ============================================================================

export interface AsistenciaEstudiante {
  idAsistencia?: number; // ID de la asistencia registrada (si existe)
  idInscripcion: number;
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  presente: boolean | null; // null = no registrado, true = presente, false = ausente
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
  alerta: boolean; // true si rebasa el límite (ej: >20% faltas)
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
  limitePorcentajeFaltas: number; // Ej: 20 para 20%
  totalClasesEsperadas: number;
  clasesRegistradas: number;
}

// Request para registrar/actualizar asistencia
export interface RegistrarAsistenciaRequest {
  idGrupoMateria: number;
  fecha: string; // ISO format: "2024-11-22"
  asistencias: {
    idInscripcion: number;
    presente: boolean;
    justificada: boolean;
    motivoJustificacion?: string;
  }[];
}

// Response del resumen de un grupo-materia
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

// Validación de fechas de clase
export interface ValidacionFechaClase {
  esFechaValida: boolean;
  esDiaDeClase: boolean;
  mensaje: string;
  diaSemanaNombre: string;
}

// Información de días de clase de una materia
export interface DiasClaseMateria {
  idGrupoMateria: number;
  nombreMateria: string;
  diasSemana: string[]; // ['Lunes', 'Miércoles', 'Viernes']
  horarios: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
    aula: string;
  }>;
}
