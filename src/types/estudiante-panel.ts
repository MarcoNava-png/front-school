export interface EstudiantePanelDto {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email: string | null;
  telefono: string | null;
  curp: string | null;
  fechaNacimiento: string | null;
  fotografia: string | null;
  activo: boolean;
  informacionAcademica: InformacionAcademicaPanelDto;
  resumenKardex: ResumenKardexDto;
  becas: BecaAsignadaDto[];
  resumenRecibos: ResumenRecibosDto;
  documentos: DocumentosDisponiblesDto;
  contactoEmergencia: ContactoEmergenciaDto | null;
  fechaConsulta: string;
}

export interface InformacionAcademicaPanelDto {
  idPlanEstudios: number | null;
  planEstudios: string | null;
  carrera: string | null;
  rvoe: string | null;
  modalidad: string | null;
  fechaIngreso: string;
  campus: string | null;
  turno: string | null;
  grupoActual: GrupoActualDto | null;
  periodoActual: PeriodoActualDto | null;
  gradoActual: string | null;
  semestreActual: number | null;
}

export interface GrupoActualDto {
  idGrupo: number;
  codigoGrupo: string;
  nombreGrupo: string | null;
  turno: string | null;
  cupoMaximo: number | null;
  alumnosInscritos: number | null;
}

export interface PeriodoActualDto {
  idPeriodoAcademico: number;
  nombre: string;
  clave: string | null;
  fechaInicio: string;
  fechaFin: string;
  esActual: boolean;
}

export interface ResumenKardexDto {
  promedioGeneral: number;
  creditosCursados: number;
  creditosTotales: number;
  porcentajeAvance: number;
  materiasAprobadas: number;
  materiasReprobadas: number;
  materiasCursando: number;
  materiasPendientes: number;
  estatusAcademico: string;
  ultimasMaterias: MateriaResumenDto[];
}

export interface MateriaResumenDto {
  claveMateria: string;
  nombreMateria: string;
  calificacionFinal: number | null;
  estatus: string;
  periodo: string | null;
}

export interface BecaAsignadaDto {
  idBecaAsignacion: number;
  idBeca: number | null;
  nombreBeca: string | null;
  claveBeca: string | null;
  tipo: string;
  valor: number;
  conceptoPago: string | null;
  topeMensual: number | null;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  activo: boolean;
  estaVigente: boolean;
  observaciones: string | null;
  descripcionDescuento: string;
}

export interface ResumenRecibosDto {
  totalAdeudo: number;
  totalPagado: number;
  recibosPendientes: number;
  recibosPagados: number;
  recibosVencidos: number;
  totalDescuentosAplicados: number;
  proximoVencimiento: ReciboPanelResumenDto | null;
  ultimosRecibos: ReciboPanelResumenDto[];
}

export interface ReciboPanelResumenDto {
  idRecibo: number;
  folio: string | null;
  concepto: string | null;
  fechaEmision: string;
  fechaVencimiento: string;
  estatus: string;
  subtotal: number;
  descuento: number;
  recargos: number;
  total: number;
  saldo: number;
  diasVencido: number | null;
  estaVencido: boolean;
  nombrePeriodo: string | null;
}

export interface DocumentosDisponiblesDto {
  tiposDisponibles: TipoDocumentoDisponibleDto[];
  solicitudesRecientes: SolicitudDocumentoResumenDto[];
  solicitudesPendientes: number;
  solicitudesGeneradas: number;
  documentosVigentes: number;
}

export interface TipoDocumentoDisponibleDto {
  idTipoDocumento: number;
  clave: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  diasVigencia: number;
  requierePago: boolean;
  tieneSolicitudPendiente: boolean;
  tieneDocumentoVigente: boolean;
}

export interface SolicitudDocumentoResumenDto {
  idSolicitud: number;
  folioSolicitud: string;
  tipoDocumento: string;
  variante: string;
  fechaSolicitud: string;
  fechaGeneracion: string | null;
  fechaVencimiento: string | null;
  estatus: string;
  estaVigente: boolean;
  puedeDescargar: boolean;
  codigoVerificacion: string | null;
}

export interface ContactoEmergenciaDto {
  nombre: string | null;
  telefono: string | null;
  parentesco: string | null;
}

export interface BuscarEstudiantesPanelRequest {
  busqueda?: string;
  idPlanEstudios?: number;
  idGrupo?: number;
  idPeriodoAcademico?: number;
  soloActivos?: boolean;
  conAdeudo?: boolean;
  conBeca?: boolean;
  pagina: number;
  tamanoPagina: number;
}

export interface BuscarEstudiantesPanelResponse {
  estudiantes: EstudianteListaDto[];
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
  estadisticas: EstadisticasEstudiantesDto;
}

export interface EstudianteListaDto {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email: string | null;
  telefono: string | null;
  planEstudios: string | null;
  grupo: string | null;
  promedioGeneral: number | null;
  adeudo: number | null;
  tieneBeca: boolean;
  activo: boolean;
  fotografia: string | null;
}

export interface EstadisticasEstudiantesDto {
  totalEstudiantes: number;
  estudiantesActivos: number;
  estudiantesConAdeudo: number;
  estudiantesConBeca: number;
  totalAdeudoGeneral: number;
  promedioGeneralInstitucional: number;
}

export interface GenerarDocumentoPanelRequest {
  idEstudiante: number;
  idTipoDocumento: number;
  variante: string;
  notas?: string;
}

export interface AccionPanelResponse {
  exitoso: boolean;
  mensaje: string;
  datos?: unknown;
}

export interface ActualizarDatosEstudianteRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string | null;
  curp: string | null;
  fechaNacimiento: string | null;
  genero: string | null;
  direccion: string | null;
  nombreContactoEmergencia: string | null;
  telefonoContactoEmergencia: string | null;
  parentescoContactoEmergencia: string | null;
}

export interface SeguimientoAcademicoDto {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  planEstudios: string;
  periodos: PeriodoAcademicoDetalleDto[];
  resumenGeneral: ResumenKardexDto;
}

export interface PeriodoAcademicoDetalleDto {
  idPeriodoAcademico: number;
  nombre: string;
  clave: string;
  fechaInicio: string;
  fechaFin: string;
  esActual: boolean;
  promedioDelPeriodo: number;
  creditosDelPeriodo: number;
  materias: MateriaDetalleDto[];
  estadisticas: EstadisticasPeriodoDto;
}

export interface MateriaDetalleDto {
  idInscripcion: number;
  idMateria: number;
  claveMateria: string;
  nombreMateria: string;
  creditos: number;
  grupo: string;
  profesor: string | null;
  parciales: ParcialesDto;
  calificacionFinal: number | null;
  estatus: 'Aprobada' | 'Reprobada' | 'Cursando' | 'Pendiente';
  fechaInscripcion: string;
  observaciones: string | null;
}

export interface ParcialesDto {
  p1: number | null;
  p2: number | null;
  p3: number | null;
}

export interface EstadisticasPeriodoDto {
  materiasTotal: number;
  materiasAprobadas: number;
  materiasReprobadas: number;
  materiasCursando: number;
  creditosObtenidos: number;
  creditosPosibles: number;
}

export const ESTATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Aprobada': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  'Reprobada': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  'Cursando': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'Pendiente': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
};

export const ESTATUS_RECIBO_COLORS: Record<string, { bg: string; text: string }> = {
  'PENDIENTE': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'PAGADO': { bg: 'bg-green-100', text: 'text-green-800' },
  'VENCIDO': { bg: 'bg-red-100', text: 'text-red-800' },
  'PARCIAL': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'CANCELADO': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export function getCalificacionColor(calificacion: number | null): string {
  if (calificacion === null) return 'text-gray-500';
  if (calificacion >= 9) return 'text-green-600 font-semibold';
  if (calificacion >= 7) return 'text-blue-600';
  if (calificacion >= 6) return 'text-yellow-600';
  return 'text-red-600 font-semibold';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export interface DocumentosPersonalesEstudianteDto {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  idAspirante: number | null;
  documentos: DocumentoPersonalDto[];
  totalDocumentos: number;
  documentosValidados: number;
  documentosPendientes: number;
}

export interface DocumentoPersonalDto {
  idAspiranteDocumento: number;
  idDocumentoRequisito: number;
  claveDocumento: string;
  nombreDocumento: string;
  estatus: string;
  fechaSubido: string | null;
  urlArchivo: string | null;
  notas: string | null;
  esObligatorio: boolean;
  fechaValidacion: string | null;
  validadoPor: string | null;
}
