import type {
  TipoDocumento,
  SolicitudDocumento,
  CrearSolicitudRequest,
  SolicitudesFiltro,
  SolicitudesListResponse,
  VerificacionDocumento,
  KardexEstudiante,
} from '@/types/documentos-estudiante'

import axiosInstance from './api-client'

const API_URL = '/documentoestudiante'

export const documentosEstudianteService = {

  async getTiposDocumento(): Promise<TipoDocumento[]> {
    const response = await axiosInstance.get<TipoDocumento[]>(`${API_URL}/tipos`)
    return response.data
  },

  async getTipoDocumentoById(id: number): Promise<TipoDocumento> {
    const response = await axiosInstance.get<TipoDocumento>(`${API_URL}/tipos/${id}`)
    return response.data
  },

  async crearSolicitud(request: CrearSolicitudRequest): Promise<SolicitudDocumento> {
    const response = await axiosInstance.post<SolicitudDocumento>(`${API_URL}/solicitar`, request)
    return response.data
  },

  async getSolicitudById(id: number): Promise<SolicitudDocumento> {
    const response = await axiosInstance.get<SolicitudDocumento>(`${API_URL}/solicitudes/${id}`)
    return response.data
  },

  async getSolicitudes(filtro: SolicitudesFiltro): Promise<SolicitudesListResponse> {
    const response = await axiosInstance.get<SolicitudesListResponse>(`${API_URL}/solicitudes`, {
      params: filtro,
    })
    return response.data
  },

  async getSolicitudesByEstudiante(idEstudiante: number): Promise<SolicitudDocumento[]> {
    const response = await axiosInstance.get<SolicitudDocumento[]>(
      `${API_URL}/estudiante/${idEstudiante}/solicitudes`
    )
    return response.data
  },

  async marcarComoGenerada(idSolicitud: number): Promise<SolicitudDocumento> {
    const response = await axiosInstance.post<SolicitudDocumento>(
      `${API_URL}/solicitudes/${idSolicitud}/generar`
    )
    return response.data
  },

  async cancelarSolicitud(idSolicitud: number, motivo: string): Promise<void> {
    await axiosInstance.post(`${API_URL}/solicitudes/${idSolicitud}/cancelar`, { motivo })
  },

  async descargarKardexPdf(idSolicitud: number): Promise<Blob> {
    const response = await axiosInstance.get(`${API_URL}/solicitudes/${idSolicitud}/kardex/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  async descargarConstanciaPdf(idSolicitud: number): Promise<Blob> {
    const response = await axiosInstance.get(`${API_URL}/solicitudes/${idSolicitud}/constancia/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  async getKardex(idEstudiante: number, soloPeriodoActual = false): Promise<KardexEstudiante> {
    const response = await axiosInstance.get<KardexEstudiante>(
      `${API_URL}/estudiante/${idEstudiante}/kardex`,
      {
        params: { soloPeriodoActual },
      }
    )
    return response.data
  },

  async verificarDocumento(codigoVerificacion: string): Promise<VerificacionDocumento> {
    const response = await axiosInstance.get<VerificacionDocumento>(
      `${API_URL}/verificar/${codigoVerificacion}`
    )
    return response.data
  },

  async notificarPago(idRecibo: number): Promise<void> {
    await axiosInstance.post(`${API_URL}/notificar-pago/${idRecibo}`)
  },

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

  openPdfInNewTab(blob: Blob): void {
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  },
}

export default documentosEstudianteService
