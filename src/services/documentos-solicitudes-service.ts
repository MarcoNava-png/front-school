import type {
  SolicitudesPendientesDto,
  FiltrosSolicitudes,
} from '@/types/documentos-solicitudes'

import axiosInstance from './api-client'

const API_URL = '/documentoestudiante'

export const documentosSolicitudesService = {
  /**
   * Obtiene todas las solicitudes para el panel de Control Escolar con estadísticas
   */
  async getSolicitudesControlEscolar(
    filtros?: FiltrosSolicitudes
  ): Promise<SolicitudesPendientesDto> {
    const params = new URLSearchParams()

    if (filtros?.estatus) {
      params.append('estatus', filtros.estatus)
    }
    if (filtros?.fechaDesde) {
      params.append('fechaDesde', filtros.fechaDesde)
    }
    if (filtros?.fechaHasta) {
      params.append('fechaHasta', filtros.fechaHasta)
    }
    if (filtros?.busqueda) {
      params.append('busqueda', filtros.busqueda)
    }

    const queryString = params.toString()
    const url = `${API_URL}/panel-control-escolar${queryString ? `?${queryString}` : ''}`

    const response = await axiosInstance.get<SolicitudesPendientesDto>(url)
    return response.data
  },

  /**
   * Obtiene el contador de solicitudes listas para generar (pagadas)
   */
  async getContadorPendientes(): Promise<number> {
    const response = await axiosInstance.get<number>(`${API_URL}/contador-pendientes`)
    return response.data
  },

  /**
   * Descarga el PDF de Kardex para una solicitud específica
   */
  async descargarKardexPdf(idSolicitud: number): Promise<Blob> {
    const response = await axiosInstance.get(
      `${API_URL}/solicitudes/${idSolicitud}/kardex/pdf`,
      { responseType: 'blob' }
    )
    return response.data
  },

  /**
   * Descarga el PDF de Constancia para una solicitud específica
   */
  async descargarConstanciaPdf(idSolicitud: number): Promise<Blob> {
    const response = await axiosInstance.get(
      `${API_URL}/solicitudes/${idSolicitud}/constancia/pdf`,
      { responseType: 'blob' }
    )
    return response.data
  },

  /**
   * Marca una solicitud como generada
   */
  async marcarComoGenerada(idSolicitud: number): Promise<void> {
    await axiosInstance.post(`${API_URL}/solicitudes/${idSolicitud}/generar`)
  },

  /**
   * Marca una solicitud como entregada fisicamente
   */
  async marcarComoEntregado(idSolicitud: number): Promise<void> {
    await axiosInstance.post(`${API_URL}/solicitudes/${idSolicitud}/entregar`)
  },

  /**
   * Cancela una solicitud
   */
  async cancelarSolicitud(idSolicitud: number, motivo: string): Promise<void> {
    await axiosInstance.post(`${API_URL}/solicitudes/${idSolicitud}/cancelar`, { motivo })
  },

  /**
   * Descarga un archivo Blob y lo guarda con el nombre especificado
   */
  downloadPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  /**
   * Genera y descarga el documento PDF según el tipo
   */
  async generarYDescargarPdf(
    idSolicitud: number,
    tipoDocumentoClave: string,
    folioSolicitud: string
  ): Promise<void> {
    let blob: Blob

    if (
      tipoDocumentoClave === 'KARDEX' ||
      tipoDocumentoClave === 'KARDEX_ACADEMICO'
    ) {
      blob = await this.descargarKardexPdf(idSolicitud)
    } else {
      blob = await this.descargarConstanciaPdf(idSolicitud)
    }

    const fecha = new Date().toISOString().split('T')[0]
    this.downloadPdf(blob, `${tipoDocumentoClave}_${folioSolicitud}_${fecha}.pdf`)
  },
}

export default documentosSolicitudesService
