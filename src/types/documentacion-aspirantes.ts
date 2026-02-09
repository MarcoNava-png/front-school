export interface DocumentacionAspiranteResumenDto {
  idAspirante: number
  nombreCompleto: string
  matricula: string | null
  planEstudios: string
  totalDocumentos: number
  documentosCompletos: number
  documentosPendientes: number
  documentosConProrroga: number
  prorrogasVencidas: number
  estatusGeneral: EstatusDocumentacionGeneral
  documentos: AspiranteDocumentoDetalleDto[]
}

export interface AspiranteDocumentoDetalleDto {
  idAspiranteDocumento: number
  clave: string
  descripcion: string
  esObligatorio: boolean
  estatus: string
  fechaSubida: string | null
  fechaProrroga: string | null
  motivoProrroga: string | null
  prorrogaVencida: boolean
  urlArchivo: string | null
  notas: string | null
}

export interface AsignarProrrogaRequest {
  idAspiranteDocumento: number
  fechaProrroga: string
  motivo?: string
}

export interface ProrrogaGlobalRequest {
  idAspirante: number
  fechaProrroga: string
  motivo?: string
}

export type EstatusDocumentacionGeneral =
  | 'COMPLETO'
  | 'INCOMPLETO'
  | 'CON_PRORROGA'
  | 'PRORROGA_VENCIDA'

export const ESTATUS_DOCUMENTACION_CONFIG: Record<
  EstatusDocumentacionGeneral,
  { label: string; color: string; bgColor: string }
> = {
  COMPLETO: {
    label: 'Completo',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  INCOMPLETO: {
    label: 'Incompleto',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  CON_PRORROGA: {
    label: 'Con Prorroga',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  PRORROGA_VENCIDA: {
    label: 'Prorroga Vencida',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
}
