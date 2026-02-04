import { superAdminAxios } from './super-admin-auth-service'

export interface TenantListItem {
  idTenant: number
  codigo: string
  nombre: string
  nombreCorto: string
  subdominio: string
  logoUrl?: string
  colorPrimario: string
  status: string
  plan: string
  fechaContratacion: string
  fechaVencimiento?: string
  lastAccessAt?: string
}

export interface TenantStats {
  totalEstudiantes: number
  estudiantesActivos: number
  totalUsuarios: number
  totalProfesores: number
  totalRecibos: number
  ingresosMes: number
  adeudoTotal: number
  aspirantesActivos: number
}

export interface TenantDetail {
  idTenant: number
  codigo: string
  nombre: string
  nombreCorto: string
  subdominio: string
  dominioPersonalizado?: string
  logoUrl?: string
  colorPrimario: string
  colorSecundario?: string
  timezone: string
  emailContacto?: string
  telefonoContacto?: string
  direccionFiscal?: string
  rfc?: string
  idPlanLicencia: number
  nombrePlan: string
  maximoEstudiantes: number
  maximoUsuarios: number
  fechaContratacion: string
  fechaVencimiento?: string
  status: number
  createdAt: string
  lastAccessAt?: string
  estadisticas?: TenantStats
}

export interface DashboardGlobal {
  totalTenants: number
  tenantsActivos: number
  tenantsPendientes: number
  tenantsSuspendidos: number
  totalEstudiantesGlobal: number
  totalUsuariosGlobal: number
  ingresosMesGlobal: number
  ultimosTenantsCreados: TenantListItem[]
  tenantsConProblemas: TenantListItem[]
}

export interface PlanLicencia {
  idPlanLicencia: number
  codigo: string
  nombre: string
  descripcion?: string
  precioMensual: number
  precioAnual?: number
  maxEstudiantes: number
  maxUsuarios: number
  maxCampus: number
  incluyeSoporte: boolean
  incluyeReportes: boolean
  incluyeAPI: boolean
  incluyeFacturacion: boolean
  activo: boolean
}

export interface CreateTenantRequest {
  codigo: string
  nombre: string
  nombreCorto: string
  subdominio: string
  logoUrl?: string
  colorPrimario?: string
  colorSecundario?: string
  emailContacto?: string
  telefonoContacto?: string
  direccionFiscal?: string
  rfc?: string
  idPlanLicencia: number
  adminEmail: string
  adminNombre: string
  adminPassword: string
}

export interface CreateTenantResponse {
  exitoso: boolean
  mensaje: string
  idTenant?: number
  codigo?: string
  url?: string
  adminEmail?: string
  passwordTemporal?: string
}

export interface UpdateTenantRequest {
  nombre?: string
  nombreCorto?: string
  dominioPersonalizado?: string
  logoUrl?: string
  colorPrimario?: string
  colorSecundario?: string
  emailContacto?: string
  telefonoContacto?: string
  direccionFiscal?: string
  rfc?: string
  idPlanLicencia?: number
  fechaVencimiento?: string
}

const BASE_URL = '/admin/tenants'

export const tenantAdminService = {
  getDashboard: async (): Promise<DashboardGlobal> => {
    const response = await superAdminAxios.get(`${BASE_URL}/dashboard`)
    return response.data
  },

  getAll: async (): Promise<TenantListItem[]> => {
    const response = await superAdminAxios.get(BASE_URL)
    return response.data
  },

  getById: async (id: number): Promise<TenantDetail> => {
    const response = await superAdminAxios.get(`${BASE_URL}/${id}`)
    return response.data
  },

  create: async (data: CreateTenantRequest): Promise<CreateTenantResponse> => {
    const response = await superAdminAxios.post(BASE_URL, data)
    return response.data
  },

  update: async (id: number, data: UpdateTenantRequest): Promise<void> => {
    await superAdminAxios.put(`${BASE_URL}/${id}`, data)
  },

  changeStatus: async (id: number, status: number, motivo?: string): Promise<void> => {
    await superAdminAxios.patch(`${BASE_URL}/${id}/status`, { nuevoStatus: status, motivo })
  },

  getStats: async (id: number): Promise<TenantStats> => {
    const response = await superAdminAxios.get(`${BASE_URL}/${id}/stats`)
    return response.data
  },

  getPlans: async (): Promise<PlanLicencia[]> => {
    const response = await superAdminAxios.get(`${BASE_URL}/planes`)
    return response.data
  },

  uploadLogo: async (id: number, file: File): Promise<{ mensaje: string; logoUrl: string }> => {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await superAdminAxios.post(`${BASE_URL}/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  deleteLogo: async (id: number): Promise<void> => {
    await superAdminAxios.delete(`${BASE_URL}/${id}/logo`)
  },
}

export default tenantAdminService
