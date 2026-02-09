export interface SolicitudesPendientesDto {
  totalPendientesPago: number
  totalListosGenerar: number
  totalGenerados: number
  totalVencidos: number
  totalCancelados: number
  totalEntregados: number
  solicitudes: SolicitudResumenDto[]
}

export interface SolicitudResumenDto {
  idSolicitud: number
  folioSolicitud: string
  idEstudiante: number
  matricula: string
  nombreEstudiante: string
  idTipoDocumento: number
  tipoDocumento: string
  tipoDocumentoClave: string
  variante: string
  estatus: EstatusSolicitudDocumento
  fechaSolicitud: string
  fechaGeneracion: string | null
  fechaVencimiento: string | null
  precioDocumento: number | null
  idRecibo: number | null
  folioRecibo: string | null
  estatusRecibo: string | null
  puedeGenerar: boolean
  usuarioSolicita: string | null
  usuarioGenera: string | null
  fechaEntrega: string | null
  usuarioEntrega: string | null
  puedeMarcarEntregado: boolean
}

export type EstatusSolicitudDocumento =
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'GENERADO'
  | 'VENCIDO'
  | 'CANCELADO'
  | 'ENTREGADO'

export interface FiltrosSolicitudes {
  estatus?: EstatusSolicitudDocumento | ''
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}

export const ESTATUS_SOLICITUD_CONFIG: Record<
  EstatusSolicitudDocumento,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  PENDIENTE_PAGO: {
    label: 'Pendiente de Pago',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'Clock',
  },
  PAGADO: {
    label: 'Listo para Generar',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'CheckCircle',
  },
  GENERADO: {
    label: 'Generado',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'FileCheck',
  },
  VENCIDO: {
    label: 'Vencido',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'AlertTriangle',
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'XCircle',
  },
  ENTREGADO: {
    label: 'Entregado',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'PackageCheck',
  },
}
