import { superAdminAxios } from './super-admin-auth-service'

export interface IngresosPorTenant {
  idTenant: number
  codigo: string
  nombreCorto: string
  colorPrimario: string
  ingresosMes: number
  ingresosAnio: number
  adeudo: number
  recibosEmitidos: number
  recibosPagados: number
}

export interface IngresosMensuales {
  anio: number
  mes: number
  nombreMes: string
  total: number
  cantidadRecibos: number
}

export interface ReporteIngresosGlobal {
  ingresosTotalMes: number
  ingresosTotalAnio: number
  adeudoTotalGlobal: number
  ingresosPorTenant: IngresosPorTenant[]
  tendenciaAnual: IngresosMensuales[]
}

export interface EstudiantesPorTenant {
  idTenant: number
  codigo: string
  nombreCorto: string
  colorPrimario: string
  totalEstudiantes: number
  activos: number
  nuevosEsteMes: number
  capacidadMaxima: number
  porcentajeOcupacion: number
}

export interface EstudiantesPorNivel {
  nivel: string
  total: number
  porcentaje: number
}

export interface ReporteEstudiantesGlobal {
  totalEstudiantes: number
  estudiantesActivos: number
  estudiantesInactivos: number
  estudiantesBaja: number
  nuevosEsteMes: number
  nuevosEsteAnio: number
  estudiantesPorTenant: EstudiantesPorTenant[]
  distribucionNivel: EstudiantesPorNivel[]
}

export interface UsoPorTenant {
  idTenant: number
  codigo: string
  nombreCorto: string
  totalUsuarios: number
  usuariosActivos: number
  ultimoAcceso?: string
  loginsMes: number
}

export interface ActividadReciente {
  idTenant: number
  tenantNombre: string
  usuario: string
  accion: string
  fecha: string
}

export interface ReporteUsoSistema {
  totalUsuarios: number
  usuariosActivos: number
  loginsMes: number
  loginsHoy: number
  usoPorTenant: UsoPorTenant[]
  actividadReciente: ActividadReciente[]
}

export interface LicenciaPorVencer {
  idTenant: number
  codigo: string
  nombreCorto: string
  plan: string
  fechaVencimiento?: string
  diasRestantes: number
  emailContacto: string
}

export interface DistribucionPlanes {
  idPlan: number
  nombrePlan: string
  cantidadTenants: number
  ingresoMensual: number
  porcentaje: number
}

export interface ReporteLicencias {
  totalTenants: number
  tenantsActivos: number
  tenantsPorVencer: number
  tenantsVencidos: number
  ingresosRecurrentesMensual: number
  proximosVencimientos: LicenciaPorVencer[]
  distribucionPlanes: DistribucionPlanes[]
}

export interface ResumenEjecutivo {
  totalEscuelas: number
  escuelasActivas: number
  totalEstudiantes: number
  estudiantesActivos: number
  ingresosMesActual: number
  ingresosAnioActual: number
  adeudoTotal: number
  ingresosRecurrentes: number
  licenciasPorVencer: number
  topEscuelasIngresos: IngresosPorTenant[]
  topEscuelasEstudiantes: EstudiantesPorTenant[]
}

const BASE_URL = '/admin/reportes'

export const reportsAdminService = {
  getReporteIngresos: async (anio?: number): Promise<ReporteIngresosGlobal> => {
    const params = anio ? `?anio=${anio}` : ''
    const response = await superAdminAxios.get(`${BASE_URL}/ingresos${params}`)
    return response.data
  },

  getReporteEstudiantes: async (): Promise<ReporteEstudiantesGlobal> => {
    const response = await superAdminAxios.get(`${BASE_URL}/estudiantes`)
    return response.data
  },

  getReporteUso: async (): Promise<ReporteUsoSistema> => {
    const response = await superAdminAxios.get(`${BASE_URL}/uso`)
    return response.data
  },

  getReporteLicencias: async (): Promise<ReporteLicencias> => {
    const response = await superAdminAxios.get(`${BASE_URL}/licencias`)
    return response.data
  },

  getResumenEjecutivo: async (): Promise<ResumenEjecutivo> => {
    const response = await superAdminAxios.get(`${BASE_URL}/resumen`)
    return response.data
  },
}

export default reportsAdminService
