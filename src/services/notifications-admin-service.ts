import { superAdminAxios } from './super-admin-auth-service'

export interface Notificacion {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  tenantCodigo?: string
  tenantNombre?: string
  idTenant?: number
  fechaCreacion: string
  leida: boolean
  fechaLectura?: string
  prioridad: string
  accionUrl?: string
}

export interface ResultadoVerificacion {
  notificacionesCreadas: number
  emailsEnviados: number
  errores: number
  detalles: string[]
}

const BASE_URL = '/admin/notificaciones'

export const notificationsAdminService = {
  getNotificaciones: async (soloNoLeidas = false, limite = 50): Promise<Notificacion[]> => {
    const params = new URLSearchParams()
    if (soloNoLeidas) params.append('soloNoLeidas', 'true')
    params.append('limite', String(limite))
    const response = await superAdminAxios.get(`${BASE_URL}?${params}`)
    return response.data
  },

  getContadorNoLeidas: async (): Promise<number> => {
    const response = await superAdminAxios.get(`${BASE_URL}/contador`)
    return response.data.count
  },

  marcarComoLeida: async (id: number): Promise<void> => {
    await superAdminAxios.post(`${BASE_URL}/${id}/leer`)
  },

  marcarVariasComoLeidas: async (ids: number[]): Promise<void> => {
    await superAdminAxios.post(`${BASE_URL}/leer`, { ids })
  },

  marcarTodasComoLeidas: async (): Promise<void> => {
    await superAdminAxios.post(`${BASE_URL}/leer-todas`)
  },

  verificarVencimientos: async (): Promise<ResultadoVerificacion> => {
    const response = await superAdminAxios.post(`${BASE_URL}/verificar-vencimientos`)
    return response.data
  },
}

export default notificationsAdminService
