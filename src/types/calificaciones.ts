export interface Parcial {
  id: number;
  name: string;
  orden: number;
}

export interface ParcialesRequest {
  name: string;
  orden: number;
}

export enum StatusParcial {
  Cerrado = 0,
  Abierto = 1,
  Publicado = 2,
}

export interface CalificacionParcial {
  id: number;
  nombreParcial: string;
  grupoMateriaId: number;
  nombreGrupo: string;
  parcialId: number;
  nombreProfesor: string;
  profesorId: number;
  statusParcial: string;
  fechaApertura: string;
  fechaCierre?: string;
}

export interface CalificacionParcialCreateRequest {
  grupoMateriaId: number;
  parcialId: number;
  profesorId: number;
  fechaApertura?: string;
}

export interface CalificacionParcialEstadoRequest {
  statusParcial: StatusParcial;
}

export enum TipoEvaluacion {
  Examen = 0,
  Tarea = 1,
  Proyecto = 2,
  Participacion = 3,
  Practica = 4,
  Otro = 5,
}

export interface CalificacionDetalle {
  id: number;
  calificacionParcialId: number;
  grupoMateriaId: number;
  tipoEvaluacionEnum: number;
  tipoEvaluacionName: string;
  nombre: string;
  pesoEvaluacion: number;
  maxPuntos: number;
  puntos: number;
  fechaAplicacion: string;
  applicationUserName: string;
  fechaCaptura: string;
}

export interface CalificacionDetalleUpsertRequest {
  id?: number;
  calificacionParcialId: number;
  grupoMateriaId: number;
  inscripcionId: number;
  tipoEvaluacionEnum: number;
  nombre: string;
  pesoEvaluacion: number;
  maxPuntos: number;
  puntos: number;
  fechaAplicacion: string;
}

export interface ConcentradoAlumno {
  inscripcionId: number;
  calificacionFinal: number;
  evaluaciones: CalificacionDetalle[];
}

export interface ConcentradoGrupoParcial {
  grupoMateriaId: number;
  parcialId: number;
  calificaciones: {
    inscripcionId: number;
    aporteParcial: number;
  }[];
}

export interface EstudianteConCalificaciones {
  inscripcionId: number;
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  calificacionParcial?: number;
  calificacionFinal?: number;
  evaluaciones: CalificacionDetalle[];
}

export interface ValidacionPesos {
  esValido: boolean;
  sumaPesos: number;
  mensaje: string;
}
