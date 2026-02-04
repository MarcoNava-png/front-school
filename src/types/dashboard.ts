export interface Alerta {
  tipo: "warning" | "danger" | "info" | "success";
  titulo: string;
  mensaje: string;
  link?: string;
  fecha?: string;
}

export interface AccionRapida {
  label: string;
  icono: string;
  link: string;
}

export interface Estadistica {
  titulo: string;
  valor: string;
  descripcion: string;
  tendencia?: string;
  tendenciaPositiva?: boolean;
}

export interface AdminDashboard {
  ingresosDia: number;
  ingresosMes: number;
  deudaTotal: number;
  porcentajeMorosidad: number;
  totalMorosos: number;

  aspirantesNuevos: number;
  conversionesDelMes: number;
  inscripcionesDelMes: number;
  bajasDelMes: number;

  estudiantesActivos: number;
  asistenciaGlobal: number;
  promedioGeneral: number;
  tasaReprobacion: number;

  totalUsuarios: number;
  gruposActivos: number;
  profesoresActivos: number;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

export interface ProgramaResumen {
  idPlanEstudios: number;
  nombre: string;
  totalEstudiantes: number;
  tasaRetencion: number;
  promedioGeneral: number;
}

export interface DirectorDashboard {
  estudiantesActivos: number;
  tendenciaEstudiantes: string;
  inscripcionesDelMes: number;
  bajasDelMes: number;

  porcentajeMorosidad: number;
  ingresosMensuales: number;

  promedioGeneral: number;
  tasaReprobacion: number;
  asistenciaGlobal: number;

  programasResumen: ProgramaResumen[];
  alertas: Alerta[];
}

export interface Moroso {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  montoAdeudado: number;
  diasVencido: number;
}

export interface FinanzasDashboard {
  ingresosDia: number;
  ingresosSemana: number;
  ingresosMes: number;
  pagosHoy: number;

  deudaTotal: number;
  totalMorosos: number;
  topMorosos: Moroso[];

  totalBecasDelMes: number;
  totalDescuentosDelMes: number;
  estudiantesConBeca: number;

  recibosPendientes: number;
  recibosVencidos: number;
  recibosPagados: number;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

export interface EstudiantesPorPrograma {
  idPlanEstudios: number;
  nombrePrograma: string;
  totalEstudiantes: number;
  porCuatrimestre: Record<number, number>;
}

export interface PeriodoActual {
  idPeriodo: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  esActivo: boolean;
}

export interface ControlEscolarDashboard {
  inscripcionesHoy: number;
  inscripcionesSemana: number;
  bajasDelMes: number;
  cambiosGrupo: number;

  estudiantesPorPrograma: EstudiantesPorPrograma[];

  documentosPendientes: number;
  expedientesIncompletos: number;

  gruposSinProfesor: number;
  gruposActivos: number;

  periodoActual?: PeriodoActual;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

export interface FunnelAdmision {
  nuevo: number;
  contactado: number;
  cita: number;
  examen: number;
  aceptado: number;
  inscrito: number;
}

export interface AdmisionesDashboard {
  prospectosHoy: number;
  prospectosSemana: number;
  prospectosDelMes: number;

  funnel: FunnelAdmision;

  conversionesDelMes: number;
  tasaConversion: number;

  citasHoy: number;
  citasPendientes: number;

  documentosPendientesAdmision: number;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

export interface GrupoAsistencia {
  idGrupo: number;
  nombreGrupo: string;
  porcentajeAsistencia: number;
  estudiantesEnRiesgo: number;
}

export interface DocentePendiente {
  idProfesor: number;
  nombreCompleto: string;
  calificacionesPendientes: number;
  asistenciasPendientes: number;
}

export interface GrupoResumen {
  idGrupo: number;
  nombre: string;
  programa: string;
  cuatrimestre: number;
  totalEstudiantes: number;
  promedioGeneral: number;
}

export interface CoordinadorDashboard {
  asistenciaPromedio: number;
  gruposEnRiesgo: GrupoAsistencia[];

  calificacionesPendientes: number;
  tasaReprobacionPorMateria: number;

  docentesConEntregasPendientes: DocentePendiente[];
  totalDocentes: number;

  gruposAsignados: number;
  misGrupos: GrupoResumen[];

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

export interface ClaseHoy {
  idGrupoMateria: number;
  materia: string;
  grupo: string;
  aula: string;
  horaInicio: string;
  horaFin: string;
  totalEstudiantes: number;
}

export interface GrupoDocente {
  idGrupoMateria: number;
  materia: string;
  grupo: string;
  totalEstudiantes: number;
  promedioGrupo: number;
  porcentajeAsistencia: number;
  tieneCalificacionesPendientes: boolean;
}

export interface FechaImportante {
  descripcion: string;
  fecha: string;
  diasRestantes: number;
  tipo: "calificaciones" | "asistencias" | "parcial";
}

export interface Anuncio {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  tipo: "general" | "urgente" | "informativo";
}

export interface DocenteDashboard {
  clasesDeHoy: ClaseHoy[];
  proximasClases: ClaseHoy[];

  asistenciasPorPasar: number;
  evaluacionesPendientes: number;

  misGrupos: GrupoDocente[];

  fechasCierreCalificaciones: FechaImportante[];

  anuncios: Anuncio[];

  alertas: Alerta[];
}

export interface ClaseAlumno {
  idGrupoMateria: number;
  materia: string;
  profesor: string;
  aula: string;
  horaInicio: string;
  horaFin: string;
  diaSemana: string;
}

export interface CalificacionReciente {
  materia: string;
  tipoEvaluacion: string;
  calificacion: number;
  fecha: string;
}

export interface TramiteDisponible {
  clave: string;
  nombre: string;
  descripcion: string;
  precio: number;
  link: string;
}

export interface AlumnoDashboard {
  matricula: string;
  nombreCompleto: string;
  programa: string;
  cuatrimestre: number;

  horarioHoy: ClaseAlumno[];
  proximasClases: ClaseAlumno[];

  calificacionesRecientes: CalificacionReciente[];
  promedioActual: number;

  tieneDeuda: boolean;
  montoDeuda?: number;
  proximoVencimiento?: string;

  porcentajeAsistencia: number;

  anuncios: Anuncio[];

  tramitesDisponibles: TramiteDisponible[];

  alertas: Alerta[];
}

export type DashboardData =
  | AdminDashboard
  | DirectorDashboard
  | FinanzasDashboard
  | ControlEscolarDashboard
  | AdmisionesDashboard
  | CoordinadorDashboard
  | DocenteDashboard
  | AlumnoDashboard;

export interface DashboardResponse {
  rol: string;
  data: DashboardData;
}

export type RoleDashboard =
  | "admin"
  | "director"
  | "finanzas"
  | "controlescolar"
  | "admisiones"
  | "coordinador"
  | "docente"
  | "alumno";
