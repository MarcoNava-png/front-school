// Tipos de documento disponibles
export interface TipoDocumento {
  idTipoDocumento: number
  clave: string
  nombre: string
  descripcion?: string
  precio: number
  diasVigencia: number
  requierePago: boolean
  activo: boolean
}

// Estados de solicitud
export type EstatusSolicitud =
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'GENERADO'
  | 'VENCIDO'
  | 'CANCELADO'

// Variantes de documento
export type VarianteDocumento = 'COMPLETO' | 'PERIODO_ACTUAL' | 'BASICO'

// Solicitud de documento
export interface SolicitudDocumento {
  idSolicitud: number
  folioSolicitud: string
  idEstudiante: number
  nombreEstudiante: string
  matricula: string
  idTipoDocumento: number
  tipoDocumentoNombre: string
  tipoDocumentoClave: string
  idRecibo?: number
  folioRecibo?: string
  variante: VarianteDocumento
  fechaSolicitud: string
  fechaGeneracion?: string
  fechaVencimiento?: string
  estatus: EstatusSolicitud
  codigoVerificacion: string
  urlVerificacion: string
  vecesImpreso: number
  notas?: string
  precio?: number
  estaVigente: boolean
  puedeGenerar: boolean
}

// Request para crear solicitud
export interface CrearSolicitudRequest {
  idEstudiante: number
  idTipoDocumento: number
  variante: VarianteDocumento
  notas?: string
}

// Filtros para buscar solicitudes
export interface SolicitudesFiltro {
  idEstudiante?: number
  idTipoDocumento?: number
  estatus?: EstatusSolicitud
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
  pagina?: number
  tamanoPagina?: number
}

// Respuesta paginada
export interface SolicitudesListResponse {
  solicitudes: SolicitudDocumento[]
  totalRegistros: number
  pagina: number
  tamanoPagina: number
  totalPaginas: number
}

// Verificación de documento (para QR)
export interface VerificacionDocumento {
  esValido: boolean
  estaVigente: boolean
  mensaje: string
  tipoDocumento?: string
  nombreEstudiante?: string
  matricula?: string
  carrera?: string
  fechaEmision?: string
  fechaVencimiento?: string
  folioDocumento?: string
}

// Kardex del estudiante
export interface KardexEstudiante {
  idEstudiante: number
  matricula: string
  nombreCompleto: string
  carrera: string
  planEstudios: string
  rvoe?: string
  fechaIngreso: string
  estatus: string
  promedioGeneral: number
  creditosCursados: number
  creditosTotales: number
  porcentajeAvance: number
  periodos: KardexPeriodo[]
}

export interface KardexPeriodo {
  periodo: string
  ciclo: string
  materias: KardexMateria[]
  promedioPeriodo: number
  creditosPeriodo: number
}

export interface KardexMateria {
  claveMateria: string
  nombreMateria: string
  creditos: number
  calificacionFinal?: number
  estatus: string
  tipoAcreditacion?: string
}

// Constancia de estudios
export interface ConstanciaEstudios {
  idEstudiante: number
  matricula: string
  nombreCompleto: string
  carrera: string
  planEstudios: string
  rvoe?: string
  periodoActual: string
  grado: string
  turno: string
  campus: string
  fechaIngreso: string
  incluyeMaterias: boolean
  materias: ConstanciaMateria[]
  fechaEmision: string
  fechaVencimiento: string
  folioDocumento: string
  codigoVerificacion: string
  urlVerificacion: string
}

export interface ConstanciaMateria {
  claveMateria: string
  nombreMateria: string
  profesor: string
  horario: string
}

// Labels para estatus
export const ESTATUS_LABELS: Record<EstatusSolicitud, string> = {
  PENDIENTE_PAGO: 'Pendiente de Pago',
  PAGADO: 'Pagado',
  GENERADO: 'Generado',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado',
}

// Colores para estatus
export const ESTATUS_COLORS: Record<EstatusSolicitud, { bg: string; text: string }> = {
  PENDIENTE_PAGO: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  PAGADO: { bg: 'bg-blue-100', text: 'text-blue-800' },
  GENERADO: { bg: 'bg-green-100', text: 'text-green-800' },
  VENCIDO: { bg: 'bg-red-100', text: 'text-red-800' },
  CANCELADO: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

// Labels para variantes
export const VARIANTE_LABELS: Record<VarianteDocumento, string> = {
  COMPLETO: 'Completo / Histórico',
  PERIODO_ACTUAL: 'Período Actual',
  BASICO: 'Básico (Sin materias)',
}
