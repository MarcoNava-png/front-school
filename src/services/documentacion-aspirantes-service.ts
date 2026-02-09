import type {
  AsignarProrrogaRequest,
  DocumentacionAspiranteResumenDto,
  ProrrogaGlobalRequest,
} from '@/types/documentacion-aspirantes'

import axiosInstance from './api-client'

const API_URL = '/aspirante'

export const documentacionAspirantesService = {
  async getResumenDocumentacion(filtros?: {
    estatus?: string
    busqueda?: string
  }): Promise<DocumentacionAspiranteResumenDto[]> {
    const params = new URLSearchParams()

    if (filtros?.estatus) {
      params.append('estatus', filtros.estatus)
    }
    if (filtros?.busqueda) {
      params.append('busqueda', filtros.busqueda)
    }

    const queryString = params.toString()
    const url = `${API_URL}/documentacion/panel${queryString ? `?${queryString}` : ''}`

    const response = await axiosInstance.get<DocumentacionAspiranteResumenDto[]>(url)
    return response.data
  },

  async asignarProrroga(request: AsignarProrrogaRequest): Promise<void> {
    await axiosInstance.post(
      `${API_URL}/documentos/${request.idAspiranteDocumento}/prorroga`,
      request
    )
  },

  async asignarProrrogaGlobal(request: ProrrogaGlobalRequest): Promise<void> {
    await axiosInstance.post(
      `${API_URL}/${request.idAspirante}/documentos/prorroga-global`,
      request
    )
  },
}

export default documentacionAspirantesService
