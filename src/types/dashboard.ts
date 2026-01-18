// ============================================================================
// BASE TYPES
// ============================================================================

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

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

export interface AdminDashboard {
  // Finanzas
  ingresosDia: number;
  ingresosMes: number;
  deudaTotal: number;
  porcentajeMorosidad: number;
  totalMorosos: number;

  // Admisiones
  aspirantesNuevos: number;
  conversionesDelMes: number;
  inscripcionesDelMes: number;
  bajasDelMes: number;

  // Académico
  estudiantesActivos: number;
  asistenciaGlobal: number;
  promedioGeneral: number;
  tasaReprobacion: number;

  // Sistema
  totalUsuarios: number;
  gruposActivos: number;
  profesoresActivos: number;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

// ============================================================================
// DIRECTOR DASHBOARD
// ============================================================================

export interface ProgramaResumen {
  idPlanEstudios: number;
  nombre: string;
  totalEstudiantes: number;
  tasaRetencion: number;
  promedioGeneral: number;
}

export interface DirectorDashboard {
  // Estudiantes
  estudiantesActivos: number;
  tendenciaEstudiantes: string;
  inscripcionesDelMes: number;
  bajasDelMes: number;

  // Finanzas (resumen)
  porcentajeMorosidad: number;
  ingresosMensuales: number;

  // Académico
  promedioGeneral: number;
  tasaReprobacion: number;
  asistenciaGlobal: number;

  programasResumen: ProgramaResumen[];
  alertas: Alerta[];
}

// ============================================================================
// FINANZAS DASHBOARD
// ============================================================================

export interface Moroso {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  montoAdeudado: number;
  diasVencido: number;
}

export interface FinanzasDashboard {
  // Ingresos
  ingresosDia: number;
  ingresosSemana: number;
  ingresosMes: number;
  pagosHoy: number;

  // Deudas
  deudaTotal: number;
  totalMorosos: number;
  topMorosos: Moroso[];

  // Becas/Descuentos
  totalBecasDelMes: number;
  totalDescuentosDelMes: number;
  estudiantesConBeca: number;

  // Estado de recibos
  recibosPendientes: number;
  recibosVencidos: number;
  recibosPagados: number;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

// ============================================================================
// CONTROL ESCOLAR DASHBOARD
// ============================================================================

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
  // Inscripciones
  inscripcionesHoy: number;
  inscripcionesSemana: number;
  bajasDelMes: number;
  cambiosGrupo: number;

  // Estudiantes por programa
  estudiantesPorPrograma: EstudiantesPorPrograma[];

  // Documentos
  documentosPendientes: number;
  expedientesIncompletos: number;

  // Grupos
  gruposSinProfesor: number;
  gruposActivos: number;

  // Periodos
  periodoActual?: PeriodoActual;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

// ============================================================================
// ADMISIONES DASHBOARD
// ============================================================================

export interface FunnelAdmision {
  nuevo: number;
  contactado: number;
  cita: number;
  examen: number;
  aceptado: number;
  inscrito: number;
}

export interface AdmisionesDashboard {
  // Prospectos
  prospectosHoy: number;
  prospectosSemana: number;
  prospectosDelMes: number;

  // Funnel
  funnel: FunnelAdmision;

  // Conversiones
  conversionesDelMes: number;
  tasaConversion: number;

  // Citas
  citasHoy: number;
  citasPendientes: number;

  // Documentos
  documentosPendientesAdmision: number;

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

// ============================================================================
// COORDINADOR DASHBOARD
// ============================================================================

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
  // Asistencia
  asistenciaPromedio: number;
  gruposEnRiesgo: GrupoAsistencia[];

  // Calificaciones
  calificacionesPendientes: number;
  tasaReprobacionPorMateria: number;

  // Docentes
  docentesConEntregasPendientes: DocentePendiente[];
  totalDocentes: number;

  // Grupos
  gruposAsignados: number;
  misGrupos: GrupoResumen[];

  alertas: Alerta[];
  accionesRapidas: AccionRapida[];
}

// ============================================================================
// DOCENTE DASHBOARD
// ============================================================================

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
  // Mis clases
  clasesDeHoy: ClaseHoy[];
  proximasClases: ClaseHoy[];

  // Pendientes
  asistenciasPorPasar: number;
  evaluacionesPendientes: number;

  // Mis grupos
  misGrupos: GrupoDocente[];

  // Fechas importantes
  fechasCierreCalificaciones: FechaImportante[];

  // Mensajes/Anuncios
  anuncios: Anuncio[];

  alertas: Alerta[];
}

// ============================================================================
// ALUMNO DASHBOARD
// ============================================================================

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
  // Información del estudiante
  matricula: string;
  nombreCompleto: string;
  programa: string;
  cuatrimestre: number;

  // Horario
  horarioHoy: ClaseAlumno[];
  proximasClases: ClaseAlumno[];

  // Calificaciones
  calificacionesRecientes: CalificacionReciente[];
  promedioActual: number;

  // Finanzas
  tieneDeuda: boolean;
  montoDeuda?: number;
  proximoVencimiento?: string;

  // Asistencias
  porcentajeAsistencia: number;

  // Anuncios
  anuncios: Anuncio[];

  // Trámites disponibles
  tramitesDisponibles: TramiteDisponible[];

  alertas: Alerta[];
}

// ============================================================================
// RESPONSE WRAPPER
// ============================================================================

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
